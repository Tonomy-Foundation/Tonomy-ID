import {
    SigningKey,
    Wallet,
    TransactionResponse,
    TransactionRequest,
    JsonRpcProvider,
    TransactionReceipt,
    computeAddress,
    Interface,
    ethers,
} from 'ethers';
import {
    IPublicKey,
    IToken,
    IChain,
    TransactionType,
    AbstractChain,
    AbstractToken,
    IAccount,
    AbstractAccount,
    ITransaction,
    AbstractPublicKey,
    AbstractPrivateKey,
    IPrivateKey,
    Asset,
    IOperation,
    IChainSession,
    ChainDetail,
} from './types';
import settings from '../../settings';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getPriceCoinGecko } from './common';
import { getSdkError } from '@walletconnect/utils';
import { IWeb3Wallet } from '@walletconnect/web3wallet';

const ETHERSCAN_API_KEY = settings.config.etherscanApiKey;
const ETHERSCAN_URL = `https://api.etherscan.io/api?apikey=${ETHERSCAN_API_KEY}`;

const INFURA_KEY = settings.config.infuraKey;

export class EthereumPublicKey extends AbstractPublicKey implements IPublicKey {
    async getAddress(): Promise<string> {
        return computeAddress(await this.toString());
    }
}

export class EthereumPrivateKey extends AbstractPrivateKey implements IPrivateKey {
    private signingKey: SigningKey;
    private wallet: Wallet;
    private chain: EthereumChain;

    constructor(privateKeyHex: string, chain: EthereumChain) {
        super(privateKeyHex, 'Secp256k1');
        this.signingKey = new SigningKey(privateKeyHex);
        this.chain = chain;
        this.wallet = new Wallet(this.signingKey, this.chain.getProvider());
    }

    async getPublicKey(): Promise<EthereumPublicKey> {
        return new EthereumPublicKey(await this.signingKey.publicKey.toString(), this.type);
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

export class EthereumChain extends AbstractChain {
    // See https://chainlist.org/ for Chain IDs
    protected infuraUrl: string;
    private provider: JsonRpcProvider;

    constructor(infuraUrl: string, name: string, chainId: string, logoUrl: string) {
        super(name, chainId, logoUrl);
        this.infuraUrl = infuraUrl;
        this.provider = new JsonRpcProvider(this.infuraUrl);
    }

    createKeyFromSeed(seed: string): IPrivateKey {
        const wallet = new ethers.Wallet(seed);

        return new EthereumPrivateKey(wallet.privateKey, this);
    }

    getInfuraUrl(): string {
        return this.infuraUrl;
    }

    formatShortAccountName(account: string): string {
        return `${account?.substring(0, 7)}...${account?.substring(account.length - 6)}`;
    }

    public getProvider(): JsonRpcProvider {
        return this.provider;
    }
}

export class EthereumToken extends AbstractToken {
    protected coinmarketCapId: string;

    constructor(
        chain: EthereumChain,
        name: string,
        symbol: string,
        precision: number,
        logoUrl: string,
        coinmarketCapId: string
    ) {
        super(name, symbol, precision, chain, logoUrl);
        this.coinmarketCapId = coinmarketCapId;
    }

    async getUsdPrice(): Promise<number> {
        return await getPriceCoinGecko(this.coinmarketCapId, 'usd');
    }
    getContractAccount(): IAccount | undefined {
        return undefined;
    }
    async getBalance(account?: IAccount): Promise<Asset> {
        const lookupAccount: IAccount =
            account ||
            this.getAccount() ||
            (() => {
                throw new Error('Account not found');
            })();

        const balanceWei = (await lookupAccount.getBalance(this.chain.getNativeToken())).getAmount();

        return new Asset(this, balanceWei);
    }

    async getUsdValue(account?: IAccount): Promise<number> {
        const balance = await this.getBalance(account);

        return balance.getUsdValue();
    }
}

const EthereumMainnetChain = new EthereumChain(
    `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    'Ethereum',
    '1',
    'https://cryptologos.cc/logos/ethereum-eth-logo.png'
);
const EthereumSepoliaChain = new EthereumChain(
    `https://sepolia.infura.io/v3/${INFURA_KEY}`,
    'sepolia',
    '11155111',
    'https://cryptologos.cc/logos/ethereum-eth-logo.png'
);

const EthereumPolygonChain = new EthereumChain(
    `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    'Polygon',
    '137',
    'https://cryptologos.cc/logos/polygon-matic-logo.png'
);

const ETHToken = new EthereumToken(
    EthereumMainnetChain,
    'Ether',
    'ETH',
    18,
    'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'ethereum'
);
const ETHSepoliaToken = new EthereumToken(
    EthereumSepoliaChain,
    'Ether',
    'SepoliaETH',
    18,
    'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'ethereum'
);

const ETHPolygonToken = new EthereumToken(
    EthereumPolygonChain,
    'Polygon',
    'MATIC',
    18,
    'https://cryptologos.cc/logos/polygon-matic-logo.png',
    'polygon'
);

EthereumMainnetChain.setNativeToken(ETHToken);
EthereumSepoliaChain.setNativeToken(ETHSepoliaToken);
EthereumPolygonChain.setNativeToken(ETHPolygonToken);

export { EthereumMainnetChain, EthereumSepoliaChain, EthereumPolygonChain, ETHToken, ETHSepoliaToken, ETHPolygonToken };

export class EthereumTransaction implements ITransaction {
    private transaction: TransactionRequest;
    private type?: TransactionType;
    private abi?: string;
    protected chain: EthereumChain;

    constructor(transaction: TransactionRequest, chain: EthereumChain) {
        this.transaction = transaction;
        this.chain = chain;
    }
    getChain(): IChain {
        return this.chain;
    }

    static async fromTransaction(
        privateKey: EthereumPrivateKey,
        transaction: TransactionRequest,
        chain: EthereumChain
    ): Promise<EthereumTransaction> {
        return new EthereumTransaction(await privateKey.populateTransaction(transaction), chain);
    }

    async getType(): Promise<TransactionType> {
        if (this.type) return this.type;
        const isContract = await (await this.getTo()).isContract();
        const isValuable = (await this.getValue()).getAmount() > BigInt(0);

        if (isContract && this.transaction.data) {
            if (isValuable) {
                this.type = TransactionType.BOTH;
            } else {
                this.type = TransactionType.CONTRACT;
            }
        } else {
            this.type = TransactionType.TRANSFER;
        }

        return this.type;
    }
    async getFrom(): Promise<EthereumAccount> {
        if (!this.transaction.from) {
            throw new Error('Transaction has no sender');
        }

        return new EthereumAccount(this.chain, this.transaction.from.toString());
    }
    async getTo(): Promise<EthereumAccount> {
        if (!this.transaction.to) {
            throw new Error('Transaction has no recipient');
        }

        return new EthereumAccount(this.chain, this.transaction.to.toString());
    }
    async fetchAbi(): Promise<string> {
        if ((await this.getType()) === TransactionType.TRANSFER) {
            throw new Error('Not a contract call');
        }

        if (this.abi) return this.abi;
        // fetch the ABI from etherscan
        const res = await fetch(
            `${ETHERSCAN_URL}&module=contract&action=getabi&address=${(await this.getTo()).getName()}`
        )
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
    async getValue(): Promise<Asset> {
        // TODO: also need to handle other tokens
        return new Asset(this.chain.getNativeToken(), BigInt(this.transaction.value || 0));
    }

    async estimateTransactionFee(): Promise<Asset> {
        // Get the current fee data
        const feeData = await this.chain.getProvider().getFeeData();

        // Update the transaction object to use maxFeePerGas and maxPriorityFeePerGas
        const transaction = {
            to: this.transaction.to,
            from: this.transaction.from,
            data: this.transaction.data,
            gasPrice: feeData.gasPrice,
        };

        // Estimate gas
        const wei = await this.chain.getProvider().estimateGas(transaction);

        const totalGasFee = feeData.gasPrice ? wei * feeData.gasPrice : wei;

        return new Asset(this.chain.getNativeToken(), totalGasFee);
    }
    async estimateTransactionTotal(): Promise<Asset> {
        const amount = (await this.getValue()).getAmount() + (await this.estimateTransactionFee()).getAmount();

        return new Asset(this.chain.getNativeToken(), amount);
    }

    async getData(): Promise<string> {
        return this.transaction.data || '';
    }

    hasMultipleOperations(): boolean {
        return false;
    }

    async getOperations(): Promise<IOperation[]> {
        throw new Error(
            'Ethereum transactions have no operations, call getTo() and other functions on EthereumTransaction instead'
        );
    }
}

export class EthereumAccount extends AbstractAccount {
    private privateKey?: EthereumPrivateKey;
    // @ts-expect-error chain is overridden
    protected chain: EthereumChain;

    private static getDidChainName(chain: EthereumChain): string {
        switch (chain.getChainId()) {
            case '1':
                return 'mainnet';
            case '5':
                return 'goerli';
            default:
                return '0x' + chain.getChainId();
        }
    }

    constructor(chain: EthereumChain, address: string, privateKey?: EthereumPrivateKey) {
        const did = `did:ethr:${EthereumAccount.getDidChainName(chain)}:${address}`;

        super(address, did, chain);
        this.privateKey = privateKey;

        this.did = did;
    }

    static async fromAddress(chain: EthereumChain, address: string): Promise<EthereumAccount> {
        return new EthereumAccount(chain, address);
    }

    static async fromPublicKey(chain: EthereumChain, publicKey: EthereumPublicKey): Promise<EthereumAccount> {
        return new EthereumAccount(chain, await publicKey.getAddress());
    }

    static async fromPrivateKey(chain: EthereumChain, privateKey: EthereumPrivateKey): Promise<EthereumAccount> {
        const address = computeAddress(privateKey.getPublicKey().toString());

        return new EthereumAccount(chain, address, privateKey);
    }

    getDid(): string {
        throw new Error('Method not implemented.');
    }

    async getTokens(): Promise<IToken[]> {
        return [this.getNativeToken()];
    }

    async signTransaction(transaction: TransactionRequest): Promise<string> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        return this.privateKey.signTransaction(transaction);
    }

    async sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        return this.privateKey.sendTransaction(transaction);
    }

    async isContract(): Promise<boolean> {
        try {
            const code = await this.chain.getProvider().getCode(this.name);

            if (code !== '0x') return true;
        } catch (error) {
            console.error('isContract()', error);
        }

        return false;
    }
}

export class WalletConnectSession implements IChainSession {
    private request: SignClientTypes.EventArguments['session_proposal'];
    private wallet: IWeb3Wallet | null;
    private namespaces: SessionTypes.Namespaces;
    private chainAccountList: ChainDetail[];

    constructor(
        request: SignClientTypes.EventArguments['session_proposal'],
        wallet: IWeb3Wallet,
        namespaces: SessionTypes.Namespaces,
        chainAccountList: ChainDetail[]
    ) {
        this.request = request;
        this.wallet = wallet;
        this.namespaces = namespaces;
        this.chainAccountList = chainAccountList;
    }

    async getActiveAccounts(): Promise<ChainDetail[]> {
        return this.chainAccountList;
    }

    async createSession(): Promise<void> {
        console.log('Creating WalletConnect session', this.namespaces);
        await this.wallet?.approveSession({
            id: this.request.id,
            relayProtocol: this.request.params.relays[0].protocol,
            namespaces: this.namespaces,
        });
    }

    async disconnectSession(): Promise<void> {
        // Logic to disconnect the WalletConnect session
        // Example: Disconnect WalletConnect provider
    }

    async createTransactionRequest(request: unknown): Promise<void> {
        // Logic to create a transaction request using WalletConnect
        // Example: Format and send the transaction request
    }

    async approveRequest(request: unknown): Promise<void> {
        // Logic to approve a WalletConnect transaction request
        // Example: Sign and approve the transaction request
    }

    async rejectRequest(): Promise<void> {
        await this.wallet?.rejectSession({
            id: this.request.id,
            reason: getSdkError('USER_REJECTED'),
        });
    }
}
