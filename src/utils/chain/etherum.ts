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
    VestedTokens,
} from './types';
import settings from '../../settings';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getPriceCoinGecko } from './common';
import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet';
import { getSdkError } from '@walletconnect/utils';
import Debug from '../debug';
import { ApplicationErrors, throwError } from '../errors';
import { KeyValue } from '../strings';
import Decimal from 'decimal.js';
import { StakingAccountState, StakingAllocation } from '@tonomy/tonomy-id-sdk';
import { PushTransactionResponse } from '@wharfkit/antelope/src/api/v1/types';
import EthLogo from '../../assets/ethereumLogo/eth-logo.png';
import MaticLogo from '../../assets/ethereumLogo/polygon-logo.png';

const debug = Debug('tonomy-id:utils:chain:ethereum');

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

    async sendTransaction(transaction: ITransaction): Promise<EthereumTransactionReceipt> {
        try {
            const precisionMultiplier = new Decimal(10).pow(this.chain.getNativeToken().getPrecision());

            const transactionRequest: TransactionRequest = {
                to: (await transaction.getTo()).getName(),
                from: (await transaction.getFrom()).getName(),
                value: (await transaction.getValue()).getAmount().mul(precisionMultiplier).toString(),
                data: ((await transaction.getData()) as TransactionRequest).data,
            };

            const receipt = await this.wallet.sendTransaction(transactionRequest);

            return new EthereumTransactionReceipt(this.chain, receipt);
        } catch (error) {
            if (error?.code === 'INSUFFICIENT_FUNDS') {
                throwError('Insufficient balance', ApplicationErrors.NotEnoughCoins);
            }

            throw error;
        }
    }
}

export class EthereumChain extends AbstractChain {
    protected chainType = ChainType.ETHEREUM;
    // See https://chainlist.org/ for Chain IDs
    protected infuraUrl: string;
    protected explorerOrigin: string;
    private provider: JsonRpcProvider;

    constructor(
        infuraUrl: string,
        name: string,
        chainId: string,
        logoUrl: string,
        explorerOrigin: string,
        testnet = false
    ) {
        super(name, chainId, logoUrl, testnet);
        this.infuraUrl = infuraUrl;
        this.provider = new JsonRpcProvider(this.infuraUrl);
        this.explorerOrigin = explorerOrigin;
    }

    createKeyFromSeed(seed: string): EthereumPrivateKey {
        const chainSeed = this.generateUniqueSeed(seed);
        const wallet = new ethers.Wallet(chainSeed);

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
    isValidAccountName(account: string): boolean {
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
        if (this.chain.isTestnet()) return 0;

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

        const balanceWei = await (this.chain as EthereumChain).getProvider().getBalance(lookupAccount.getName() || '');

        const precisionMultiplier = new Decimal(10).pow(this.getPrecision());

        return new Asset(this, new Decimal(balanceWei.toString()).div(precisionMultiplier));
    }

    async getUsdValue(account?: IAccount): Promise<number> {
        const balance = await this.getBalance(account);

        return balance.getUsdValue();
    }

    async getAvailableBalance(account?: IAccount): Promise<IAsset> {
        return this.getBalance(account);
    }
}

export const EthereumMainnetChain = new EthereumChain(
    `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    'Ethereum',
    '1',
    EthLogo,
    'https://etherscan.io'
);
export const EthereumSepoliaChain = new EthereumChain(
    `https://sepolia.infura.io/v3/${INFURA_KEY}`,
    'sepolia',
    '11155111',
    EthLogo,
    'https://sepolia.etherscan.io',
    true
);

export const EthereumPolygonChain = new EthereumChain(
    `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    'Polygon',
    '137',
    MaticLogo,
    'https://polygonscan.com'
);

export const ETHToken = new EthereumToken(EthereumMainnetChain, 'Ether', 'ETH', 18, EthLogo, 'ethereum');
export const ETHSepoliaToken = new EthereumToken(EthereumSepoliaChain, 'Ether', 'SepoliaETH', 18, EthLogo, 'ethereum');

export const ETHPolygonToken = new EthereumToken(EthereumPolygonChain, 'Polygon', 'MATIC', 18, MaticLogo, 'polygon');

EthereumMainnetChain.setNativeToken(ETHToken);
EthereumSepoliaChain.setNativeToken(ETHSepoliaToken);
EthereumPolygonChain.setNativeToken(ETHPolygonToken);

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
        const isValuable = (await this.getValue()).getAmount().greaterThan(0);

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
            .then((data) => data);

        if (res.status !== '1') {
            throw new Error('Failed to fetch ABI');
        }

        this.abi = res.result as string;
        return this.abi;
    }
    async getFunction(): Promise<string> {
        const abi = await this.fetchAbi();

        if (!this.transaction.data) throw new Error('Transaction has no data');
        const decodedData = new Interface(abi).parseTransaction({ data: this.transaction.data });

        if (!decodedData?.name) throw new Error('Failed to decode function name');
        return decodedData.name;
    }
    async getArguments(): Promise<KeyValue> {
        const abi = await this.fetchAbi();

        if (!this.transaction.data) throw new Error('Transaction has no data');
        const decodedData = new Interface(abi).parseTransaction({ data: this.transaction.data });

        if (!decodedData?.args) throw new Error('Failed to decode function name');
        return decodedData.args;
    }
    async getValue(): Promise<Asset> {
        // TODO: also need to handle other tokens
        const precisionMultiplier = new Decimal(10).pow(this.chain.getNativeToken().getPrecision());

        return new Asset(
            this.chain.getNativeToken(),
            new Decimal(this.transaction.value ? this.transaction.value.toString() : '0').div(precisionMultiplier)
        );
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
        const precisionMultiplier = new Decimal(10).pow(this.chain.getNativeToken().getPrecision());

        return new Asset(this.chain.getNativeToken(), new Decimal(totalGasFee.toString()).div(precisionMultiplier));
    }
    async estimateTransactionTotal(): Promise<Asset> {
        const amount = (await this.getValue()).getAmount().plus((await this.estimateTransactionFee()).getAmount());

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

    getExpiration(): Date | null {
        return null;
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
        const precisionMultiplier = new Decimal(10).pow(this.chain.getNativeToken().getPrecision());

        return new Asset(this.chain.getNativeToken(), new Decimal(receipt.fee.toString()).div(precisionMultiplier));
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

    async sendTransaction(transaction: ITransaction): Promise<EthereumTransactionReceipt> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        return this.privateKey.sendTransaction(transaction);
    }

    async isContract(): Promise<boolean> {
        const code = await (this.chain as EthereumChain).getProvider().getCode(this.name);

        if (code !== '0x') return true;
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
            value: (await transaction.getValue()).getAmount().toString(),
            data: (await transaction.getData()).data,
        };

        return transactionRequest;
    }

    async approveTransactionRequest(
        request: Web3WalletTypes.SessionRequest,
        receipt: EthereumTransactionReceipt
    ): Promise<void> {
        const signedTransaction = receipt.getRawReceipt();
        const response = { id: request.id, result: signedTransaction, jsonrpc: '2.0' };

        await this.wallet.respondSessionRequest({ topic: request.topic, response });
    }

    async rejectTransactionRequest(request: Web3WalletTypes.SessionRequest): Promise<void> {
        const response = {
            id: request.id,
            error: getSdkError('USER_REJECTED'),
            jsonrpc: '2.0',
        };

        await this.wallet.respondSessionRequest({
            topic: request.topic,
            response,
        });
    }
}
