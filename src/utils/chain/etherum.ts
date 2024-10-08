import {
    SigningKey,
    Wallet,
    TransactionResponse,
    TransactionRequest,
    JsonRpcProvider,
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
    IOperation,
    ExplorerOptions,
    AbstractTransactionReceipt,
    IAsset,
    ChainType,
} from './types';
import settings from '../../settings';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getPriceCoinGecko } from './common';
import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet';
import { getSdkError } from '@walletconnect/utils';
import Debug from 'debug';

const debug = Debug('tonomy-id:utils:chain:ethereum');

const ETHERSCAN_API_KEY = settings.config.etherscanApiKey;
const ETHERSCAN_URL = `https://api.etherscan.io/api?apikey=${ETHERSCAN_API_KEY}`;

const INFURA_KEY = settings.config.infuraKey;

export const USD_CONVERSION = 0.002;

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

    async sendTransaction(transaction: TransactionRequest): Promise<EthereumTransactionReceipt> {
        const receipt = await this.wallet.sendTransaction(transaction);

        return new EthereumTransactionReceipt(this.chain, receipt);
    }
}

export class EthereumChain extends AbstractChain {
    protected chainType = ChainType.ETHEREUM;
    // See https://chainlist.org/ for Chain IDs
    protected infuraUrl: string;
    protected explorerOrigin: string;
    private provider: JsonRpcProvider;

    constructor(infuraUrl: string, name: string, chainId: string, logoUrl: string, explorerOrigin: string) {
        super(name, chainId, logoUrl);
        this.infuraUrl = infuraUrl;
        this.provider = new JsonRpcProvider(this.infuraUrl);
        this.explorerOrigin = explorerOrigin;
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

    getProvider(): JsonRpcProvider {
        return this.provider;
    }

    getExplorerUrl(options?: ExplorerOptions): string {
        if (options) {
            if (options.transactionHash) {
                return `${this.explorerOrigin}/tx/${options.transactionHash}`;
            } else if (options.accountName) {
                return `${this.explorerOrigin}/address/${options.accountName}`;
            }
        }

        return this.explorerOrigin;
    }
    isValidCryptoAddress(account: string): boolean {
        const regex = /^0x[a-fA-F0-9]{40}$/;

        return regex.test(account);
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

        debug('getBalance() lookupAccount', lookupAccount.getName());
        const balanceWei = await (this.chain as EthereumChain).getProvider().getBalance(lookupAccount.getName() || '');

        debug('getBalance() balance', balanceWei);

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
    'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'https://etherscan.io'
);
const EthereumSepoliaChain = new EthereumChain(
    `https://sepolia.infura.io/v3/${INFURA_KEY}`,
    'sepolia',
    '11155111',
    'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'https://sepolia.etherscan.io'
);

const EthereumPolygonChain = new EthereumChain(
    `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    'Polygon',
    '137',
    'https://cryptologos.cc/logos/polygon-matic-logo.png',
    'https://polygonscan.com'
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

    async getData(): Promise<TransactionRequest> {
        return this.transaction;
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

export class EthereumTransactionReceipt extends AbstractTransactionReceipt {
    private receipt: TransactionResponse;

    constructor(chain: EthereumChain, receipt: TransactionResponse) {
        super(chain);
        this.receipt = receipt;
    }

    getTransactionHash(): string {
        return this.receipt.hash;
    }

    getExplorerUrl(): string {
        return this.chain.getExplorerUrl({ transactionHash: this.getTransactionHash() });
    }

    async getFee(): Promise<IAsset> {
        const receipt = await this.receipt.wait();

        if (!receipt) throw new Error('Failed to fetch receipt');
        return new Asset(this.chain.getNativeToken(), receipt.fee);
    }

    async getTimestamp(): Promise<Date> {
        const receipt = await this.receipt.wait();
        const provider = (this.chain as EthereumChain).getProvider();

        if (!receipt) throw new Error('Failed to fetch receipt');
        const block = await provider.getBlock(receipt?.blockNumber);

        if (!block) throw new Error('Failed to fetch block');

        return new Date(block.timestamp * 1000);
    }

    getRawReceipt(): TransactionResponse {
        return this.receipt;
    }
}

export class EthereumAccount extends AbstractAccount {
    private privateKey?: EthereumPrivateKey;

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

    async sendTransaction(transaction: TransactionRequest): Promise<EthereumTransactionReceipt> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        return this.privateKey.sendTransaction(transaction);
    }

    async isContract(): Promise<boolean> {
        try {
            const code = await (this.chain as EthereumChain).getProvider().getCode(this.name);

            if (code !== '0x') return true;
        } catch (error) {
            console.error('EthereumAccount.isContract()', error);
        }

        return false;
    }
}

export class WalletConnectSession implements IChainSession {
    private wallet: IWeb3Wallet;
    private namespaces: SessionTypes.Namespaces;
    private accounts: EthereumAccount[];

    constructor(wallet: IWeb3Wallet) {
        this.wallet = wallet;
    }

    setNamespaces(namespaces: SessionTypes.Namespaces): void {
        this.namespaces = namespaces;
    }

    getNamespaces(): SessionTypes.Namespaces {
        return this.namespaces;
    }

    setActiveAccounts(accounts: EthereumAccount[]): void {
        this.accounts = accounts;
    }

    async getActiveAccounts(): Promise<EthereumAccount[]> {
        return this.accounts;
    }

    async createSession(request: SignClientTypes.EventArguments['session_proposal']): Promise<void> {
        await this.wallet.approveSession({
            id: request.id,
            namespaces: this.getNamespaces(),
        });
    }

    async cancelSessionRequest(request: SignClientTypes.EventArguments['session_proposal']): Promise<void> {
        await this.wallet.rejectSession({
            id: request.id,
            reason: getSdkError('USER_REJECTED'),
        });
    }

    async createTransactionRequest(transaction: EthereumTransaction): Promise<TransactionRequest> {
        const transactionRequest: TransactionRequest = {
            to: (await transaction.getTo()).getName(),
            from: (await transaction.getFrom()).getName(),
            value: (await transaction.getValue()).getAmount(),
            data: (await transaction.getData()).data,
        };

        return transactionRequest;
    }

    async approveTransactionRequest(
        request: Web3WalletTypes.SessionRequest,
        receipt: EthereumTransactionReceipt
    ): Promise<void> {
        if (request) {
            const signedTransaction = receipt.getRawReceipt();
            const response = { id: request.id, result: signedTransaction, jsonrpc: '2.0' };

            await this.wallet.respondSessionRequest({ topic: request.topic, response });
        } else {
            throw new Error('Invalid request');
        }
    }

    async rejectTransactionRequest(request: Web3WalletTypes.SessionRequest): Promise<void> {
        if (request) {
            const response = {
                id: request.id,
                error: getSdkError('USER_REJECTED'),
                jsonrpc: '2.0',
            };

            await this.wallet.respondSessionRequest({
                topic: request.topic,
                response,
            });
        } else {
            throw new Error('Invalid request');
        }
    }
}
