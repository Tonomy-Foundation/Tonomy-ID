import {
    IPublicKey,
    IToken,
    IOperation,
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
    ChainType,
    IAsset,
    ExplorerOptions,
    AbstractTransactionReceipt,
    VestedTokens,
} from './types';
import {
    ABI,
    ABISerializableConstructor,
    Action,
    Asset as AntelopeAsset,
    API,
    APIClient,
    Bytes,
    FetchProvider,
    KeyType,
    Name,
    NameType,
    PermissionLevelType,
    PrivateKey,
    PublicKey,
    Serializer,
    SignedTransaction,
    Transaction,
} from '@wharfkit/antelope';
import { GetInfoResponse, PushTransactionResponse } from '@wharfkit/antelope/src/api/v1/types';
import { IdentityV3, ResolvedSigningRequest } from '@wharfkit/signing-request';
import Debug from '../debug';
import { createUrl, getQueryParam, KeyValue, serializeAny } from '../strings';
import {
    StakingAccountState,
    SdkErrors,
    AntelopePushTransactionError,
    HttpError,
    isErrorCode,
    getVestingContract,
} from '@tonomy/tonomy-id-sdk';
import { hexToBytes, bytesToHex } from 'did-jwt';
import { ApplicationErrors, throwError } from '../errors';
import { captureError } from '../sentry';
import Decimal from 'decimal.js';
import { Signer, getStakingContract } from '@tonomy/tonomy-id-sdk';
import settings from '../../settings';
import TokenLogo from '../../assets/tonomyProduction/favicon.png';
import TonomyLogo from '../../assets/tonomyProduction/logo48x48.png';
import { formatAssetToNumber } from '../numbers';

const debug = Debug('tonomy-id:utils:chain:antelope');

export class AntelopePublicKey extends AbstractPublicKey implements IPublicKey {
    private publicKey: PublicKey;

    constructor(publicKey: PublicKey) {
        const type = publicKey.type === KeyType.K1 ? 'Secp256k1' : 'Secp256r1';
        const publicKeyHex = new TextDecoder().decode(publicKey.data.array);

        super(publicKeyHex, type);

        this.publicKey = publicKey;
    }

    toPublicKey(): PublicKey {
        return this.publicKey;
    }
}

interface MapObject {
    [key: string]: any;
}

/**
 * Action data for a transaction
 * @property {NameType} account - The smart contract account name
 * @property {NameType} name - The name of the action (function in the smart contract)
 * @property {MapObject} data - The data for the action (arguments for the function)
 * @property {PermissionLevelType[]} authorization - The authorization(s) for the action
 */
export type ActionData = {
    account: NameType;
    name: NameType;
    authorization: PermissionLevelType[];
    data: MapObject;
};

export class AntelopeTransactionReceipt extends AbstractTransactionReceipt {
    private receipt: API.v1.PushTransactionResponse;
    private transaction: SignedTransaction;

    constructor(chain: AntelopeChain, receipt: API.v1.PushTransactionResponse, transaction: SignedTransaction) {
        super(chain);
        this.receipt = receipt;
        this.transaction = transaction;
    }

    getTransactionHash(): string {
        return this.receipt.transaction_id;
    }

    async getFee(): Promise<IAsset> {
        return new Asset(this.getChain().getNativeToken(), new Decimal(0));
    }

    getExplorerUrl(): string {
        return this.getChain().getExplorerUrl({ transactionHash: this.getTransactionHash() });
    }

    async getTimestamp(): Promise<Date> {
        return new Date(this.receipt.processed.block_time);
    }

    getRawReceipt(): API.v1.PushTransactionResponse {
        return this.receipt;
    }

    getRawTransaction(): SignedTransaction {
        return this.transaction;
    }
}

export class AntelopePrivateKey extends AbstractPrivateKey implements IPrivateKey {
    private privateKey: PrivateKey;
    private chain: AntelopeChain;

    constructor(privateKey: PrivateKey, chain: AntelopeChain) {
        const type = privateKey.type === KeyType.K1 ? 'Secp256k1' : 'Secp256r1';
        const privateKeyHex = bytesToHex(privateKey.data.array);

        super(privateKeyHex, type);
        this.privateKey = privateKey;
        this.chain = chain;
    }

    static fromPrivateKeyHex(privateKeyHex: string, chain: AntelopeChain): AntelopePrivateKey {
        const keyUint8Array = hexToBytes(privateKeyHex);

        const bytes = Bytes.from(keyUint8Array, 'hex');
        const privateKey = new PrivateKey(KeyType.K1, bytes);

        return new AntelopePrivateKey(privateKey, chain);
    }

    async getPublicKey(): Promise<AntelopePublicKey> {
        return new AntelopePublicKey(this.privateKey.toPublic());
    }

    async signTransaction(data: ActionData[] | AntelopeTransaction): Promise<SignedTransaction> {
        const actionData: ActionData[] = data instanceof AntelopeTransaction ? await data.getData() : data;

        // Get the ABI(s) of all contracts

        // Create the action data
        const actions: Action[] = [];

        for (const action of actionData) {
            if (action.name.toString() === 'identity') {
                const abi: ABI = Serializer.synthesize(IdentityV3 as ABISerializableConstructor);

                // eslint-disable-next-line camelcase
                abi.actions = [{ name: 'identity', type: 'identity', ricardian_contract: '' }];
                actions.push(Action.from(action, abi));
            } else {
                const api = await this.chain.getApiClient();
                const uniqueContracts = [...new Set(actionData.map((data) => data.account))];
                const abiPromises = uniqueContracts.map((contract) => api.v1.chain.get_abi(contract));
                const abiArray = await Promise.all(abiPromises);
                const abiMap = new Map(abiArray.map((abi) => [abi.account_name, abi.abi]));
                const abi = abiMap.get(action.account.toString());

                actions.push(Action.from(action, abi));
            }
        }

        // Construct the transaction
        const info = await this.chain.getChainInfo();
        const header = info.getTransactionHeader();
        const defaultExpiration = new Date(new Date().getTime() + ANTELOPE_DEFAULT_TRANSACTION_EXPIRE_SECONDS);
        let expiration: Date =
            data instanceof AntelopeTransaction ? data.getExpiration() ?? defaultExpiration : defaultExpiration;
        const remainingCounter = Math.floor((expiration.getTime() - new Date().getTime()) / 1000);

        if (remainingCounter < 5) {
            expiration = new Date(expiration.getTime() + 10 * 1000);
        }

        const transaction = Transaction.from({
            ...header,
            expiration,
            actions,
        });

        // Create signature
        if (info.chain_id.toString() !== this.chain.getAntelopeChainId()) throw new Error('Chain ID mismatch');
        const signDigest = transaction.signingDigest(info.chain_id.toString());

        const signatures = [this.privateKey.signDigest(signDigest)];

        return SignedTransaction.from({
            ...transaction,
            signatures,
        });
    }

    async sendTransaction(data: ActionData[] | AntelopeTransaction): Promise<AntelopeTransactionReceipt> {
        try {
            const transaction = await this.signTransaction(data);

            const receipt = await this.chain.getApiClient().v1.chain.push_transaction(transaction);

            return new AntelopeTransactionReceipt(this.chain, receipt, transaction);
        } catch (error) {
            if (
                error?.message?.includes(
                    'Provided keys, permissions, and delays do not satisfy declared authorizations at'
                )
            ) {
                throwError('Incorrect Transaction Authorization', ApplicationErrors.IncorrectTransactionAuthorization);
            }

            if (error.response?.headers) {
                if (error.response?.json) {
                    const actions = data instanceof AntelopeTransaction ? await data.getData() : data;
                    const contractName = actions[0]?.account; //contract account name

                    throw new AntelopePushTransactionError({ ...error.response.json, actions, contract: contractName });
                }

                throw new HttpError(error);
            }

            throw error;
        }
    }

    toPrivateKey(): PrivateKey {
        return this.privateKey;
    }
}

export class AntelopeChain extends AbstractChain {
    protected chainType = ChainType.ANTELOPE;
    protected antelopeChainId: string;
    protected apiOrigin: string;
    protected explorerOrigin: string;
    private apiClient: APIClient;

    constructor(
        apiOrigin: string,
        name: string,
        antelopeChainId: string,
        logoUrl: string,
        explorerOrigin: string,
        testnet = false
    ) {
        const chainId = 'antelope-' + antelopeChainId;

        super(name, chainId, logoUrl, testnet);
        this.antelopeChainId = antelopeChainId;
        this.apiOrigin = apiOrigin;
        this.explorerOrigin = explorerOrigin;
    }

    createKeyFromSeed(seed: string): AntelopePrivateKey {
        const bytes = Bytes.from(seed, 'hex');
        const privateKey = new PrivateKey(KeyType.K1, bytes);

        return new AntelopePrivateKey(privateKey, this);
    }

    getAntelopeChainId(): string {
        return this.antelopeChainId;
    }

    getApiOrigin(): string {
        return this.apiOrigin;
    }

    getApiClient(): APIClient {
        if (this.apiClient) return this.apiClient;
        this.apiClient = new APIClient({
            url: this.apiOrigin,
            provider: new FetchProvider(this.apiOrigin),
        });
        return this.apiClient;
    }

    async getChainInfo(): Promise<GetInfoResponse> {
        // @ts-expect-error GetInfoResponse type mismatch
        return await this.getApiClient().v1.chain.get_info();
    }

    formatShortAccountName(account: string): string {
        return account;
    }

    getExplorerUrl(options?: ExplorerOptions): string {
        let url = this.explorerOrigin;

        if (options) {
            if (options.transactionHash) {
                url += `/transaction/${options.transactionHash}`;
            } else if (options.accountName) {
                url += `/account/${options.accountName}`;
            }
        }

        return url;
    }
    isValidAccountName(account: string): boolean {
        const regex = /^[a-z1-5.]{1,12}$/;

        return regex.test(account);
    }
}

const privateRoundPrice = (0.0001 * 2.0) / 3.0;
const tonoSalesPrices = {
    seed: privateRoundPrice,
    preSale: privateRoundPrice,
    private: privateRoundPrice,
    kol: privateRoundPrice,
    publicSale: 0.0001,
};

export const TONO_CURRENT_PRICE = tonoSalesPrices.publicSale;

export class AntelopeToken extends AbstractToken implements IToken {
    protected coinmarketCapId: string;

    constructor(
        chain: AntelopeChain,
        name: string,
        symbol: string,
        precision: number,
        logoUrl: string,
        coinmarketCapId: string,
        transferable = true,
        vestable = false,
        stakeable = false,
        swapable = false
    ) {
        super(name, symbol, precision, chain, logoUrl, transferable, vestable, stakeable, swapable);
        this.coinmarketCapId = coinmarketCapId;
    }

    getChain(): AntelopeChain {
        return this.chain as AntelopeChain;
    }

    async getUsdPrice(): Promise<number> {
        if (this.getChain().isTestnet()) return 0;

        switch (this.getChain().getName()) {
            case 'Tonomy':
                return TONO_CURRENT_PRICE;
            default:
                throw new Error('Unsupported Antelope chain');
        }
    }

    getContractAccount(): IAccount {
        return AntelopeAccount.fromAccount(this.getChain(), 'eosio.token');
    }

    async getBalance(account?: AntelopeAccount): Promise<IAsset> {
        const contractAccount = this.getContractAccount();

        if (!contractAccount) throw new Error('Token has no contract account');
        const lookupAccount: IAccount =
            account ||
            this.getAccount() ||
            (() => {
                throw new Error('Account not found');
            })();

        const api = this.getChain().getApiClient();

        const assets = await api.v1.chain.get_currency_balance(
            contractAccount.getName(),
            lookupAccount.getName(),
            this.getSymbol()
        );

        const asset = assets.find((asset) => asset.symbol.toString() === this.toAntelopeSymbol().toString());

        if (!asset) return new Asset(this, new Decimal(0));
        let amount;

        if (typeof asset.units.value === 'object') {
            amount = formatAssetToNumber(asset.toString());
        } else amount = new Decimal(asset.units.value);

        return new Asset(this, amount);
    }

    toAntelopeSymbol(): AntelopeAsset.Symbol {
        return AntelopeAsset.Symbol.fromParts(this.getSymbol(), this.getPrecision());
    }

    async getUsdValue(account?: AntelopeAccount): Promise<number> {
        const balance = await this.getBalance(account);

        return balance.getUsdValue();
    }

    async getAvailableBalance(account?: AntelopeAccount): Promise<IAsset> {
        return this.getBalance(account);
    }
}

export class TonomyToken extends AntelopeToken {
    async getBalance(account?: AntelopeAccount): Promise<IAsset> {
        const availableBalance = await this.getAvailableBalance(account);
        const vestedBalance = await this.getVestedTotalBalance(account);

        // Ensure we retrieve staking state correctly
        let stakedBalance = new Asset(this, new Decimal(0));

        try {
            const stakingState = await this.getAccountStateData(account as IAccount);
            const totalStaked = stakingState.totalStaked + stakingState.totalUnlocking;

            // Convert totalStaked to an Asset
            stakedBalance = new Asset(this, new Decimal(totalStaked));
        } catch (e) {
            if (isErrorCode(e, SdkErrors.AccountNotFound)) {
                debug('getBalance() Account not found');
            }
        }

        return availableBalance.add(vestedBalance).add(stakedBalance);
    }

    async getAvailableBalance(account?: AntelopeAccount): Promise<IAsset> {
        return super.getBalance(account);
    }

    async getVestedTotalBalance(account?: AntelopeAccount): Promise<IAsset> {
        const lookupAccount: IAccount =
            account ||
            this.getAccount() ||
            (() => {
                throw new Error('Account not found');
            })();

        const vestedBalance = await getVestingContract().getBalance(lookupAccount.getName());

        debug('getVestedTotalBalance() vestedBalance', vestedBalance);
        return new Asset(this, new Decimal(vestedBalance));
    }

    async getVestedTokens(account: IAccount): Promise<VestedTokens> {
        return await getVestingContract().getVestingAllocations(account.getName());
    }

    async withdrawVestedTokens(account: IAccount, accountSigner: Signer): Promise<PushTransactionResponse> {
        return await getVestingContract().withdraw(account.getName(), accountSigner);
    }

    async getAccountStateData(account: IAccount): Promise<StakingAccountState> {
        return await getStakingContract().getAccountState(account.getName());
    }

    async stakeTokens(account: IAccount, amount: string, accountSigner: Signer): Promise<PushTransactionResponse> {
        return await getStakingContract().stakeTokens(account.getName(), amount, accountSigner);
    }

    async unStakeTokens(
        account: IAccount,
        allocationId: number,
        accountSigner: Signer
    ): Promise<PushTransactionResponse> {
        return await getStakingContract().requestUnstake(account.getName(), allocationId, accountSigner);
    }

    async getCalculatedYield(amount: number): Promise<number> {
        const settings = await getStakingContract().getSettings();

        return getStakingContract().calculateMonthlyYield(amount, settings);
    }
}

export const TonomyMainnetChain = new AntelopeChain(
    'https://pangea.eosusa.io',
    'Tonomy',
    '66d565f72ac08f8321a3036e2d92eea7f96ddc90599bdbfc2d025d810c74c248',
    TonomyLogo,
    'https://explorer.tonomy.io'
);

export const TonomyTestnetChain = new AntelopeChain(
    'https://test.pangea.eosusa.io',
    'Tonomy Testnet',
    '8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f',
    TonomyLogo,
    'https://explorer.testnet.tonomy.io',
    true
);

export const TonomyStagingChain = new AntelopeChain(
    'https://blockchain-api-staging.tonomy.foundation/',
    'Tonomy Staging',
    '8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f',
    TonomyLogo,
    'https://local.bloks.io/?nodeUrl=https%3A%2F%2Fblockchain-api-staging.tonomy.foundation&coreSymbol=TONO&corePrecision=6&systemDomain=eosio',
    true
);

export const TonomyLocalChain = new AntelopeChain(
    settings.config.blockchainUrl,
    'Tonomy Localhost',
    'unknown chain id at this time',
    TonomyLogo,
    'https://local.bloks.io/?nodeUrl=https%3A%2F%2Fblockchain-api-staging.tonomy.foundation&coreSymbol=TONO&corePrecision=6&systemDomain=eosio',
    true
);

export const TONOToken = new TonomyToken(
    TonomyMainnetChain,
    'TONO',
    'TONO',
    6,
    TokenLogo,
    'tono',
    false,
    true,
    true,
    true
);

export const TONOTestnetToken = new TonomyToken(
    TonomyTestnetChain,
    'TestnetTONO',
    'TONO',
    6,
    TokenLogo,
    'tono-testnet',
    false,
    true,
    true,
    true
);

export const TONOStagingToken = new TonomyToken(
    TonomyStagingChain,
    'StagingTONO',
    'TONO',
    6,
    TokenLogo,
    'tono-staging',
    false,
    true,
    true,
    true
);

export const TONOLocalToken = new TonomyToken(
    TonomyLocalChain,
    'LocalTONO',
    'TONO',
    6,
    TokenLogo,
    'tono-local',
    false,
    true,
    true,
    true
);

export const EOSJungleChain = new AntelopeChain(
    'https://jungle4.cryptolions.io',
    'EOS Jungle Testnet',
    '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
    'https://jungle3.bloks.io/img/chains/jungle.png',
    'https://jungle3.bloks.io',
    true
);

export const EOSJungleToken = new AntelopeToken(
    EOSJungleChain,
    'EOS',
    'JungleEOS',
    4,
    TokenLogo,
    'jungle',
    false,
    false,
    false
);

EOSJungleChain.setNativeToken(EOSJungleToken);
TonomyMainnetChain.setNativeToken(TONOToken);
TonomyTestnetChain.setNativeToken(TONOTestnetToken);
TonomyStagingChain.setNativeToken(TONOStagingToken);
TonomyLocalChain.setNativeToken(TONOLocalToken);

export const ANTELOPE_CHAIN_ID_TO_CHAIN: Record<string, AntelopeChain> = {};

// ANTELOPE_CHAIN_ID_TO_CHAIN[TonomyMainnetChain.getAntelopeChainId()] = TonomyMainnetChain;
// ANTELOPE_CHAIN_ID_TO_CHAIN[TonomyTestnetChain.getAntelopeChainId()] = TonomyTestnetChain;
ANTELOPE_CHAIN_ID_TO_CHAIN[EOSJungleChain.getAntelopeChainId()] = EOSJungleChain;

export function getChainFromAntelopeChainId(chainId: string): AntelopeChain {
    if (!ANTELOPE_CHAIN_ID_TO_CHAIN[chainId]) throw new Error('Antelope chain not supported');
    return ANTELOPE_CHAIN_ID_TO_CHAIN[chainId];
}

export class AntelopeAction implements IOperation {
    private action: ActionData;
    private chain: AntelopeChain;

    constructor(action: ActionData, chain: AntelopeChain) {
        this.action = action;
        this.chain = chain;
    }

    async getType(): Promise<TransactionType> {
        // TODO: need to also handle token transfers on other contracts
        if (
            this.action.name.toString() === 'transfer' &&
            this.action.data.to &&
            this.action.data.from &&
            this.action.data.quantity
        ) {
            return TransactionType.TRANSFER;
        } else {
            return TransactionType.CONTRACT;
        }
    }

    async getTo(): Promise<AntelopeAccount> {
        if ((await this.getType()) === TransactionType.TRANSFER) {
            return AntelopeAccount.fromAccount(this.chain, this.action.data.to);
        } else {
            return AntelopeAccount.fromAccount(this.chain, this.action.account);
        }
    }

    async getFrom(): Promise<AntelopeAccount> {
        if ((await this.getType()) === TransactionType.BOTH) {
            return AntelopeAccount.fromAccount(this.chain, this.action.data.from);
        } else {
            return AntelopeAccount.fromAccount(this.chain, this.action.authorization[0].actor);
        }
    }
    async getArguments(): Promise<KeyValue> {
        const data = this.action.data;
        const args: KeyValue = {};

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];

                debug('getArguments()', key, value);

                try {
                    args[key] = serializeAny(value);
                } catch (error) {
                    args[key] = 'unserializable';
                    captureError(`getArguments() serialize arg`, error);
                }
            }
        }

        return args;
    }
    async getFunction(): Promise<string> {
        return this.action.name.toString();
    }
    async getValue(): Promise<IAsset> {
        // TODO: need to also handle token transfers on other contracts

        if ((await this.getType()) === TransactionType.TRANSFER) {
            const quantity = this.action.data.quantity.toString();

            return getAssetFromQuantity(quantity, this.chain);
        } else {
            return new Asset(this.chain.getNativeToken(), new Decimal(0));
        }
    }
}

/*
 * Converts a quantity string to an Asset
 * @param {string} quantity - The quantity string e.g. "1.0000 TONO"
 * @param {AntelopeChain} chain - The chain the asset is on
 * @returns {IAsset} - The asset
 */

export function getAssetFromQuantity(quantity: string, chain: AntelopeChain): IAsset {
    const name = quantity.split(' ')[1];
    const symbol = name;
    const amountString = quantity.split(' ')[0];

    const precision = amountString.includes('.') ? amountString.split('.')[1].length : 0;

    const token = new AntelopeToken(chain, name, symbol, precision, '', '');
    const amount = new Decimal(amountString);

    return new Asset(token, amount);
}

export const ANTELOPE_DEFAULT_TRANSACTION_EXPIRE_SECONDS = 120;

export class AntelopeTransaction implements ITransaction {
    private actions: ActionData[];
    protected chain: AntelopeChain;
    protected account: AntelopeAccount;
    private expirationDate: Date | null = null;

    constructor(
        actions: ActionData[],
        chain: AntelopeChain,
        account: AntelopeAccount,
        timeoutSeconds = ANTELOPE_DEFAULT_TRANSACTION_EXPIRE_SECONDS
    ) {
        this.actions = actions;
        this.chain = chain;
        this.account = account;
        this.setExpiration(timeoutSeconds);
    }

    getChain(): AntelopeChain {
        return this.chain;
    }

    static fromActions(actions: ActionData[], chain: AntelopeChain, account: AntelopeAccount): AntelopeTransaction {
        return new AntelopeTransaction(actions, chain, account);
    }

    async getType(): Promise<TransactionType> {
        throw new Error('Antelope transactions have multiple operations, call getOperations()');
    }
    async getFrom(): Promise<AntelopeAccount> {
        return this.account;
    }
    async getTo(): Promise<AntelopeAccount> {
        throw new Error('Antelope transactions have multiple operations, call getOperations()');
    }
    async getFunction(): Promise<string> {
        throw new Error('Antelope transactions have multiple operations, call getOperations()');
    }
    async getArguments(): Promise<KeyValue> {
        throw new Error('Antelope transactions have multiple operations, call getOperations()');
    }
    async getValue(): Promise<Asset> {
        throw new Error('Antelope transactions have multiple operations, call getOperations()');
    }
    async getData(): Promise<ActionData[]> {
        return this.actions;
    }
    async estimateTransactionFee(): Promise<Asset> {
        return new Asset(this.chain.getNativeToken(), new Decimal(0));
    }

    async estimateTransactionTotal(): Promise<Asset> {
        const operationAmountsPromises = (await this.getOperations()).map(async (operation) =>
            (await operation.getValue()).getAmount()
        );
        // const operationAmounts = (await Promise.all(operationAmountsPromises)).reduce((a, b) => a + b, BigInt(0));
        //     this return string

        // let amount = operationAmounts + (await this.estimateTransactionFee()).getAmount();
        // Ensure all operation amounts are BigInt
        const operationAmounts = (await Promise.all(operationAmountsPromises)).reduce((a, b) => {
            return a.plus(b);
        }, new Decimal(0));

        const estimatedFee = new Decimal((await this.estimateTransactionFee()).getAmount());

        const amount = operationAmounts.plus(estimatedFee);

        return new Asset(this.chain.getNativeToken(), amount);
    }

    hasMultipleOperations(): boolean {
        return true;
    }
    async getOperations(): Promise<IOperation[]> {
        return this.actions.map((action) => new AntelopeAction(action, this.chain));
    }
    private setExpiration(timeoutSeconds: number) {
        const now = new Date();

        this.expirationDate = new Date(now.getTime() + timeoutSeconds * 1000);
    }
    getExpiration(): Date | null {
        return this.expirationDate;
    }
}

export class AntelopeAccount extends AbstractAccount implements IAccount {
    private privateKey?: AntelopePrivateKey;

    private static getDidChainName(chain: AntelopeChain): string | null {
        switch (chain.getName()) {
            case 'Tonomy':
                return 'tonomy';
            case 'Tonomy Testnet':
                return 'tonomy:testnet';
            default:
                return null;
        }
    }
    constructor(chain: AntelopeChain, account: NameType) {
        const accountName = Name.from(account).toString();
        const chainSpecifier = AntelopeAccount.getDidChainName(chain) ?? chain.getAntelopeChainId();
        const did = `did:antelope:${chainSpecifier}:${accountName}`;

        super(accountName, did, chain);
    }

    static fromAccount(chain: AntelopeChain, account: NameType): AntelopeAccount {
        return new AntelopeAccount(chain, account);
    }

    static fromAccountAndPrivateKey(
        chain: AntelopeChain,
        account: NameType,
        privateKey: AntelopePrivateKey
    ): AntelopeAccount {
        const myAccount = new AntelopeAccount(chain, account);

        myAccount.privateKey = privateKey;
        return myAccount;
    }

    getDid(): string {
        throw new Error('Method not implemented.');
    }

    async getTokens(): Promise<IToken[]> {
        return [this.getNativeToken()];
    }

    async signTransaction(data: ActionData[] | AntelopeTransaction): Promise<SignedTransaction> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        return this.privateKey.signTransaction(data);
    }

    async sendTransaction(data: ActionData[] | AntelopeTransaction): Promise<AntelopeTransactionReceipt> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        //TODO: catch overdraw balance error and throw application error NotEnoughCoins
        return await this.privateKey.sendTransaction(data);
    }

    async isContract(): Promise<boolean> {
        try {
            const api = (this.chain as AntelopeChain).getApiOrigin();
            const res = await fetch(`${api}/v1/chain/get_code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // eslint-disable-next-line camelcase
                    account_name: this.getName(),
                    // eslint-disable-next-line camelcase
                    code_as_wasm: 1,
                }),
            });
            const resBody = await res.json();

            // TODO: check if this is working
            if (resBody.wasm && resBody.wasm.length > 0) {
                return true;
            }
        } catch (error) {
            console.log('isContract() errror', error);
        }

        return false;
    }
}

export class ErrorWithResponse extends Error {
    response: Response;
    constructor(message: string, response: Response) {
        super(message);
        this.response = response;
    }
}

export class AntelopeSigningRequestSession implements IChainSession {
    private transaction: AntelopeTransaction;
    private account: AntelopeAccount;
    private antelopeKey: AntelopePrivateKey;
    private chain: AntelopeChain;

    constructor(antelopeKey: AntelopePrivateKey, chain: AntelopeChain) {
        this.antelopeKey = antelopeKey;
        this.chain = chain;
    }

    async createSession(request: ResolvedSigningRequest): Promise<void> {
        //TODO
    }
    async cancelSessionRequest(request: unknown): Promise<void> {
        //TODO
    }
    async getActiveAccounts(): Promise<AntelopeAccount[]> {
        return [this.account];
    }

    async createTransactionRequest(transaction: AntelopeTransaction): Promise<AntelopeTransaction> {
        return transaction;
    }

    async approveTransactionRequest(
        request: ResolvedSigningRequest,
        receipt: AntelopeTransactionReceipt
    ): Promise<void> {
        const signedTransaction = receipt.getRawTransaction();
        const trxId = receipt.getTransactionHash();
        const callbackParams = request.getCallback(signedTransaction.signatures, 0);

        debug('approveTransactionRequest() callbackParams', callbackParams);

        if (callbackParams) {
            const uid = getQueryParam(callbackParams.url, 'uid');

            const bodyObject = callbackParams.payload;

            bodyObject.tx = trxId;
            // eslint-disable-next-line camelcase
            bodyObject.tx_id = trxId;
            bodyObject.uid = uid;

            // eslint-disable-next-line camelcase
            const newCallback = createUrl(callbackParams.url, { uid, tx_id: trxId });

            debug('approveTransactionRequest() callback', new Date(), newCallback, bodyObject);
            const response = await fetch(newCallback, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyObject),
            });

            debug('approveTransactionRequest() response status', response.status);

            if (!response.ok || response.status !== 200) {
                const error = new ErrorWithResponse(`Failed to send callback`, response);

                captureError('approveTransactionRequest()', error);
            }
        }
    }

    async rejectTransactionRequest(resolvedSigningRequest: ResolvedSigningRequest): Promise<void> {
        const callback = resolvedSigningRequest.request.data.callback;

        debug('rejectTransactionRequest() callback', callback);

        if (callback) {
            const origin = new URL(callback).origin;
            const response = await fetch(origin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rejected: 'Request cancelled from within Anchor.',
                }),
            });

            if (!response.ok || response.status !== 200) {
                captureError('rejectTransactionRequest()', new ErrorWithResponse(`Failed to send callback`, response));
            }
        }
    }
}
