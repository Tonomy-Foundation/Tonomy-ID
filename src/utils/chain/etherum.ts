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
    IChainSession,
} from './types';
import settings from '../../settings';
import { SignClientTypes } from '@walletconnect/types';

export const USD_CONVERSION = 0.002;

const ETHERSCAN_API_KEY = settings.config.etherscanApiKey;
const ETHERSCAN_URL = `https://api.etherscan.io/api?apikey=${ETHERSCAN_API_KEY}`;

const INFURA_KEY = settings.config.infuraKey;

export async function getPrice(token: string, currency: string): Promise<number> {
    const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=${currency}`
    ).then((res) => res.json());

    return res?.ethereum?.usd;
}

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
    protected infuraUrl: string;
    protected name: string;
    protected chainId: string;
    protected logoUrl: string;
    protected nativeToken: IToken;
    private provider: JsonRpcProvider;

    constructor(infuraUrl: string, name: string, chainId: string, logoUrl: string) {
        super();
        this.infuraUrl = infuraUrl;
        this.name = name;
        this.chainId = chainId;
        this.logoUrl = logoUrl;
        this.provider = new JsonRpcProvider(this.infuraUrl);
    }

    addToken(token: IToken): void {
        this.nativeToken = token;
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
    protected name: string;
    protected symbol: string;
    protected precision: number;
    protected chain: EthereumChain;
    protected logoUrl: string;
    protected coinmarketCapId: string;

    constructor(
        chain: EthereumChain,
        name: string,
        symbol: string,
        precision: number,
        logoUrl: string,
        coinmarketCapId: string
    ) {
        super();
        this.name = name;
        this.symbol = symbol;
        this.precision = precision;
        this.logoUrl = logoUrl;
        this.coinmarketCapId = coinmarketCapId;
        this.chain = chain;
    }

    async getUsdPrice(): Promise<number> {
        return await getPrice(this.coinmarketCapId, 'usd');
    }
    getContractAccount(): IAccount | undefined {
        return undefined;
    }
    async getBalance(account?: IAccount): Promise<Asset> {
        const lookupAccount: IAccount =
            account ||
            this.account ||
            (() => {
                throw new Error('Account not found');
            })();

        const balanceWei = await this.chain.getProvider().getBalance(lookupAccount.getName() || '');

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

EthereumMainnetChain.addToken(ETHToken);
EthereumSepoliaChain.addToken(ETHSepoliaToken);
EthereumPolygonChain.addToken(ETHPolygonToken);

export { EthereumMainnetChain, EthereumSepoliaChain, EthereumPolygonChain, ETHToken, ETHSepoliaToken, ETHPolygonToken };

export class EthereumTransaction implements ITransaction {
    private transaction: TransactionRequest;
    private type?: TransactionType;
    private abi?: string;
    protected chain: EthereumChain;
    protected session: EthereumChainSession;

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

        return new EthereumAccount(this.chain, this.transaction.from.toString());
    }
    getTo(): EthereumAccount {
        if (!this.transaction.to) {
            throw new Error('Transaction has no recipient');
        }

        return new EthereumAccount(this.chain, this.transaction.to.toString());
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
    async getValue(): Promise<Asset> {
        return new Asset(this.chain.getNativeToken(), BigInt(this.transaction.value || 0));
    }

    async estimateTransactionFee(): Promise<Asset> {
        // Get the current fee data
        const feeData = await this.chain.getProvider().getFeeData();

        console.log('feeData', feeData);
        // Update the transaction object to use maxFeePerGas and maxPriorityFeePerGas
        const transaction = {
            to: this.transaction.to,
            data: this.transaction.data,
            value: this.transaction.value,
            gasPrice: feeData.gasPrice,
        };

        // Estimate gas
        const wei = await this.chain.getProvider().estimateGas(transaction);

        console.log('wei', wei);
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
}

export class EthereumAccount extends AbstractAccount {
    private privateKey?: EthereumPrivateKey;
    protected name: string;
    protected did: string;
    protected chain: EthereumChain;

    constructor(chain: EthereumChain, address: string, privateKey?: EthereumPrivateKey) {
        super();
        this.privateKey = privateKey;
        this.name = address;
        this.chain = chain;
        const did = `did:ethr:${address}`; // needs to be different for different chains

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

    async sendSignedTransaction(signedTransaction: string): Promise<TransactionReceipt> {
        return this.chain.getProvider().send('eth_sendRawTransaction', [signedTransaction]);
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
            console.log('error', error);
        }

        return false;
    }
}

export class EthereumChainSession implements IChainSession {
    private payload: SignClientTypes.EventArguments['session_proposal'];
    private chain: EthereumChain;

    constructor(payload: SignClientTypes.EventArguments['session_proposal'], chain: EthereumChain) {
        this.payload = payload;
        this.chain = chain;
    }

    getId(): number {
        return this.payload.id;
    }

    getName(): string {
        return this.payload.params.proposer.metadata.name;
    }

    getUrl(): string {
        return this.payload.params.proposer.metadata.url;
    }

    getIcons(): string | null {
        if (this.payload.params.proposer.metadata.icons?.length > 0) {
            return this.payload.params.proposer.metadata.icons[0];
        }

        return null;
    }
}
