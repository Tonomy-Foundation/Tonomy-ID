import {
    SigningKey,
    Wallet,
    TransactionResponse,
    formatEther,
    TransactionRequest,
    JsonRpcProvider,
    TransactionReceipt,
    computeAddress,
    Interface,
} from 'ethers';
import {
    IPublicKey,
    IToken,
    TransactionType,
    AbstractChain,
    AbstractToken,
    IAccount,
    AbstractAccount,
    ITransaction,
    AbstractPublicKey,
    AbstractPrivateKey,
    AbstractAsset,
} from './types';
import { IKeyManager } from '@veramo/core-types';

const ETHERSCAN_API_KEY = 'your-etherscan-api-key';
const ETHERSCAN_URL = `https://api.etherscan.io/api?apikey=${ETHERSCAN_API_KEY}`;

const INFURA_KEY = 'your-infura-id';
const INFURA_URL = `https://mainnet.infura.io/v3/${INFURA_KEY}`;
const provider = new JsonRpcProvider(INFURA_URL);

async function getPrice(token: string, currency: string): Promise<number> {
    const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=${currency}`
    ).then((res) => res.json());

    return res.ethereum.usd;
}

export class EthereumPublicKey extends AbstractPublicKey {
    async getAddress(): Promise<string> {
        return computeAddress(await this.toString());
    }
}

export class EthereumPrivateKey extends AbstractPrivateKey {
    private signingKey: SigningKey;
    private wallet: Wallet;
    protected kid: string;
    protected keyManager: IKeyManager;

    constructor(keyManager: IKeyManager, kid: string, signingKey: SigningKey) {
        super();
        this.keyManager = keyManager;
        this.kid = kid;
        this.signingKey = signingKey;
        this.wallet = new Wallet(this.signingKey, provider);
    }

    async initialize(keyManager: IKeyManager, kid: string): Promise<EthereumPrivateKey> {
        const privateKey = (await keyManager.keyManagerGet({ kid })).privateKeyHex;

        if (!privateKey) throw new Error('Private key not found');
        const signingKey = new SigningKey(privateKey);

        return new EthereumPrivateKey(keyManager, kid, signingKey);
    }

    async getPublicKey(): Promise<IPublicKey> {
        return new EthereumPublicKey(await this.getKey());
    }

    async getAddress(): Promise<string> {
        return computeAddress(this.signingKey);
    }

    async signTransaction(transaction: TransactionRequest): Promise<string> {
        return this.wallet.signTransaction(await this.populateTransaction(transaction));
    }

    async populateTransaction(transaction: TransactionRequest): Promise<TransactionRequest> {
        return this.wallet.populateTransaction(transaction);
    }

    async sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
        return this.wallet.sendTransaction(transaction);
    }
}

class EthereumChain extends AbstractChain {
    protected name = 'Ethereum';
    protected chainId = '1';
    protected logoUrl = 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
    protected apiEndpoint = new URL(INFURA_URL).origin;
    protected nativeToken = new ETHToken();
}

class ETHAsset extends AbstractAsset {
    protected token: IToken;
    protected amount: bigint;

    constructor(token: IToken, amount: bigint) {
        super();
        this.token = token;
        this.amount = amount;
    }

    async getUsdValue(): Promise<number> {
        const price = await getPrice('ethereum', 'usd');
        const usdValue = BigInt(this.amount) * BigInt(price) * BigInt(10) ** BigInt(this.token.getPrecision());

        return parseFloat(usdValue.toString());
    }
}

class ETHToken extends AbstractToken {
    protected name = 'Ether';
    protected symbol = 'ETH';
    protected precision = 18;
    protected chain = new EthereumChain();
    protected logoUrl = 'https://cryptologos.cc/logos/ethereum-eth-logo.png';

    async getUsdPrice(): Promise<number> {
        return await getPrice('ethereum', 'usd');
    }
    getContractAccount(): IAccount | undefined {
        return undefined;
    }
    async getBalance(account?: IAccount): Promise<ETHAsset> {
        const lookupAccount: IAccount =
            account ||
            this.account ||
            (() => {
                throw new Error('Account not found');
            })();

        const balanceWei = await provider.getBalance(lookupAccount.getName() || '');

        return new ETHAsset(this, balanceWei);
    }

    async getUsdValue(account?: IAccount): Promise<number> {
        const balance = await this.getBalance(account);

        return balance.getUsdValue();
    }
}

class EthereumTransaction implements ITransaction {
    private transaction: TransactionRequest;
    private type?: TransactionType;
    private abi?: string;

    constructor(transaction: TransactionRequest) {
        this.transaction = transaction;
    }

    async fromTransaction(
        privateKey: EthereumPrivateKey,
        transaction: TransactionRequest
    ): Promise<EthereumTransaction> {
        return new EthereumTransaction(await privateKey.populateTransaction(transaction));
    }

    async getType(): Promise<TransactionType> {
        if (this.type) return this.type;
        const isContract = await this.getTo().isContract();
        const isValuable = (await this.getValue()).getAmount() > BigInt(0);

        if (isContract && this.transaction.data) {
            if (isValuable) {
                this.type = TransactionType.both;
            } else {
                this.type = TransactionType.contract;
            }
        } else {
            this.type = TransactionType.transfer;
        }

        return this.type;
    }
    getFrom(): EthereumAccount {
        if (!this.transaction.from) {
            throw new Error('Transaction has no sender');
        }

        return new EthereumAccount(this.transaction.from.toString());
    }
    getTo(): EthereumAccount {
        if (!this.transaction.to) {
            throw new Error('Transaction has no recipient');
        }

        return new EthereumAccount(this.transaction.to.toString());
    }
    async fetchAbi(): Promise<string> {
        if ((await this.getType()) === TransactionType.transfer) {
            throw new Error('Not a contract call');
        }

        if (this.abi) return this.abi;
        // fetch the ABI from etherscan
        const res = await fetch(`${ETHERSCAN_URL}&module=contract&action=getabi&address=${this.getTo().getName()}`)
            .then((res) => res.json())
            .then((data) => data.result);

        if (res.status !== '1') {
            throw new Error('Failed to fetch ABI');
        }

        this.abi = res.abi as string;
        return this.abi;
    }
    async getFunction(): Promise<string> {
        const abi = await this.fetchAbi();

        if (!this.transaction.data) throw new Error('Transaction has no data');
        const decodedData = new Interface(abi).parseTransaction({ data: this.transaction.data });

        if (!decodedData?.name) throw new Error('Failed to decode function name');
        return decodedData.name;
    }
    async getArguments(): Promise<Record<string, string>> {
        const abi = await this.fetchAbi();

        if (!this.transaction.data) throw new Error('Transaction has no data');
        const decodedData = new Interface(abi).parseTransaction({ data: this.transaction.data });

        if (!decodedData?.args) throw new Error('Failed to decode function name');
        return decodedData.args;
    }
    async getValue(): Promise<ETHAsset> {
        return new ETHAsset(new ETHToken(), BigInt(this.transaction.value || 0));
    }
    async estimateTransactionFee(): Promise<ETHAsset> {
        const wei = await provider.estimateGas(this.transaction);

        return new ETHAsset(new ETHToken(), wei);
    }
    async estimateTransactionTotal(): Promise<ETHAsset> {
        const amount = (await this.getValue()).getAmount() + (await this.estimateTransactionFee()).getAmount();

        return new ETHAsset(new ETHToken(), amount);
    }
}

class EthereumAccount extends AbstractAccount {
    private privateKey?: EthereumPrivateKey;
    protected name: string;
    protected did: string;
    protected chain = new EthereumChain();
    protected nativeToken = new ETHToken();

    constructor(address: string, privateKey?: EthereumPrivateKey) {
        super();
        this.privateKey = privateKey;
        this.name = address;
        const did = `did:ethr:${address}`;

        this.did = did;
    }

    async fromPrivateKey(privateKey: EthereumPrivateKey): Promise<EthereumAccount> {
        const address = computeAddress(privateKey.getPublicKey().toString());

        return new EthereumAccount(address, privateKey);
    }

    async fromPublicKey(publicKey: EthereumPublicKey): Promise<EthereumAccount> {
        return new EthereumAccount(await publicKey.getAddress());
    }

    async getTokens(): Promise<IToken[]> {
        return [this.nativeToken];
    }

    async signTransaction(transaction: TransactionRequest): Promise<string> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        return this.privateKey.signTransaction(transaction);
    }

    async sendSignedTransaction(signedTransaction: string): Promise<TransactionReceipt> {
        return provider.send('eth_sendRawTransaction', [signedTransaction]);
    }

    async sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        return this.privateKey.sendTransaction(transaction);
    }

    async isContract(): Promise<boolean> {
        try {
            const code = await provider.getCode(this.name);

            if (code !== '0x') return true;
        } catch (error) { }

        return false;
    }
}
