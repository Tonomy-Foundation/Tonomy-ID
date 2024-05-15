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
    // IPrivateKey,
    // IPublicKey,
    // KeyType,
    // KeyFormat,
    IToken,
    TransactionType,
    AbstractChain,
    AbstractToken,
    IAccount,
    AbstractAccount,
    ITransaction,
} from './types';

const ETHERSCAN_API_KEY = 'your-etherscan-api-key';
const ETHERSCAN_URL = `https://api.etherscan.io/api?apikey=${ETHERSCAN_API_KEY}`;

const INFURA_KEY = 'your-infura-id';
const INFURA_URL = `https://mainnet.infura.io/v3/${INFURA_KEY}`;
const provider = new JsonRpcProvider(INFURA_URL);

export class EthereumPublicKey implements IPublicKey {
    private publicKey: string;

    constructor(publicKey: string) {
        this.publicKey = publicKey;
    }

    getType(): KeyType {
        return KeyType.secpk1;
    }

    toString(format?: KeyFormat): string {
        return this.publicKey;
    }
}

export class EthereumPrivateKey implements IPrivateKey {
    private privateKey: SigningKey;
    private wallet: Wallet;

    constructor(key: string | SigningKey) {
        if (typeof key === 'string' && !key.startsWith('0x')) {
            key = '0x' + key;
        }

        const signingKey = typeof key === 'string' ? new SigningKey(key) : key;

        this.privateKey = signingKey;
        this.wallet = new Wallet(signingKey, provider);
    }

    getType(): KeyType {
        return KeyType.secpk1;
    }

    toString(format?: KeyFormat): string {
        return this.privateKey.privateKey;
    }

    getPublicKey(): IPublicKey {
        return new EthereumPublicKey(this.privateKey.publicKey);
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

class ETHToken extends AbstractToken {
    protected name = 'Ether';
    protected symbol = 'ETH';
    protected precision = 18;
    protected chain = new EthereumChain();
    protected logoUrl = 'https://cryptologos.cc/logos/ethereum-eth-logo.png';

    getUsdPrice(): Promise<number> {
        return fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
            .then((res) => res.json())
            .then((data) => data.ethereum.usd);
    }
    getContractAccount(): IAccount | undefined {
        return undefined;
    }
    async getBalance(account?: IAccount): Promise<number> {
        const lookupAccount: IAccount =
            account ||
            this.account ||
            (() => {
                throw new Error('Account not found');
            })();

        const balanceWei = await provider.getBalance(lookupAccount.getName() || '');
        const balanceEther = formatEther(balanceWei);

        return parseFloat(balanceEther);
    }

    async getUsdValue(account?: IAccount): Promise<number> {
        const balance = await this.getBalance(account);
        const usdPrice = await this.getUsdPrice();

        return balance * usdPrice;
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
        const isValuable = (await this.getValue()) > 0;

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
    async getValue(): Promise<number> {
        return parseFloat(formatEther(this.transaction.value || 0));
    }
    async estimateTransactionFee(): Promise<number> {
        const wei = await provider.estimateGas(this.transaction);
        const ether = formatEther(wei);

        return parseFloat(ether);
    }
    async estimateTransactionTotal(): Promise<number> {
        return (await this.getValue()) + (await this.estimateTransactionFee());
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
        const address = computeAddress(publicKey.toString());

        return new EthereumAccount(address);
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
