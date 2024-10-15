import {
    IPublicKey,
    IToken,
    IChain,
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
} from './types';
import {
    ABI,
    ABISerializableConstructor,
    Action,
    Asset as AntelopeAsset,
    API,
    APIClient,
    Bytes,
    Checksum256,
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
import { GetInfoResponse } from '@wharfkit/antelope/src/api/v1/types';
import { IdentityV3, ResolvedSigningRequest } from '@wharfkit/signing-request';
import Debug from 'debug';
import { createUrl, getQueryParam } from '../strings';

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
        return new Asset(this.getChain().getNativeToken(), 0n);
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
        const privateKeyHex = new TextDecoder().decode(privateKey.data.array);

        super(privateKeyHex, type);
        this.privateKey = privateKey;
        this.chain = chain;
    }

    async getPublicKey(): Promise<AntelopePublicKey> {
        return new AntelopePublicKey(this.privateKey.toPublic());
    }

    async signTransaction(data: ActionData[] | AntelopeTransaction): Promise<SignedTransaction> {
        const actions: ActionData[] = data instanceof AntelopeTransaction ? await data.getData() : data;
        // Get the ABI(s) of all contracts

        // Create the action data
        const actionData: Action[] = [];

        for (const action of actions) {
            if (action.name.toString() === 'identity') {
                const abi: ABI = Serializer.synthesize(IdentityV3 as ABISerializableConstructor);

                // eslint-disable-next-line camelcase
                abi.actions = [{ name: 'identity', type: 'identity', ricardian_contract: '' }];
                actionData.push(Action.from(action, abi));
            } else {
                const api = await this.chain.getApiClient();
                const uniqueContracts = [...new Set(actions.map((data) => data.account))];
                const abiPromises = uniqueContracts.map((contract) => api.v1.chain.get_abi(contract));
                const abiArray = await Promise.all(abiPromises);
                const abiMap = new Map(abiArray.map((abi) => [abi.account_name, abi.abi]));
                const abi = abiMap.get(action.account.toString());

                actionData.push(Action.from(action, abi));
            }
        }

        // Construct the transaction
        const info = await this.chain.getChainInfo();
        const header = info.getTransactionHeader();
        const transaction = Transaction.from({
            ...header,
            actions: actionData,
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
        const transaction = await this.signTransaction(data);

        try {
            const receipt = await this.chain.getApiClient().v1.chain.push_transaction(transaction);

            return new AntelopeTransactionReceipt(this.chain, receipt, transaction);
        } catch (error) {
            console.error('sendTransaction()', JSON.stringify(error, null, 2));
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

    constructor(apiOrigin: string, name: string, antelopeChainId: string, logoUrl: string, explorerOrigin: string) {
        const chainId = 'antelope-' + antelopeChainId;

        super(name, chainId, logoUrl);
        this.antelopeChainId = antelopeChainId;
        this.apiOrigin = apiOrigin;
        this.explorerOrigin = explorerOrigin;
    }

    createKeyFromSeed(seed: string): AntelopePrivateKey {
        const bytes: Bytes = Bytes.from(Checksum256.hash(seed));
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
        if (options) {
            if (options.transactionHash) {
                return `${this.explorerOrigin}/transaction/${options.transactionHash}`;
            } else if (options.accountName) {
                return `${this.explorerOrigin}/account/${options.accountName}`;
            }
        }

        return this.explorerOrigin;
    }
}

export const LEOS_SEED_ROUND_PRICE = 0.0002;
export const LEOS_SEED_LATE_ROUND_PRICE = 0.0004;
export const LEOS_PUBLIC_SALE_PRICE = 0.0012;
export const LEOS_CURRENT_PRICE = LEOS_SEED_ROUND_PRICE;

export class AntelopeToken extends AbstractToken implements IToken {
    protected coinmarketCapId: string;

    constructor(
        chain: AntelopeChain,
        name: string,
        symbol: string,
        precision: number,
        logoUrl: string,
        coinmarketCapId: string
    ) {
        super(name, symbol, precision, chain, logoUrl);
        this.coinmarketCapId = coinmarketCapId;
    }

    getChain(): AntelopeChain {
        return this.chain as AntelopeChain;
    }

    async getUsdPrice(): Promise<number> {
        switch (this.getChain().getName()) {
            case 'Pangea':
                return LEOS_PUBLIC_SALE_PRICE;
            case 'Pangea Testnet':
                return LEOS_PUBLIC_SALE_PRICE;
            case 'EOS Jungle Testnet':
                return LEOS_PUBLIC_SALE_PRICE;
            default:
                throw new Error('Unsupported Antelope chain');
        }
    }

    getContractAccount(): IAccount {
        return AntelopeAccount.fromAccount(this.getChain(), 'eosio.token');
    }

    async getBalance(account?: AntelopeAccount): Promise<Asset> {
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

        if (!asset) return new Asset(this, BigInt(0));
        return new Asset(this, BigInt(asset.units.value));
    }

    toAntelopeSymbol(): AntelopeAsset.Symbol {
        return AntelopeAsset.Symbol.fromParts(this.getSymbol(), this.getPrecision());
    }

    async getUsdValue(account?: AntelopeAccount): Promise<number> {
        const balance = await this.getBalance(account);

        return balance.getUsdValue();
    }
}

const PangeaMainnetChain = new AntelopeChain(
    // 'https://blockchain-api.pangea.web4.world',
    'https://pangea.eosusa.io',
    'Pangea',
    '66d565f72ac08f8321a3036e2d92eea7f96ddc90599bdbfc2d025d810c74c248',
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/Pangea%20256x256.png?raw=true',
    'https://explorer.pangea.web4.world'
);

const PangeaTestnetChain = new AntelopeChain(
    // 'https://blockchain-api-testnet.pangea.web4.world',
    'https://test.pangea.eosusa.io',
    'Pangea Testnet',
    '8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f',
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/Pangea%20256x256.png?raw=true',
    'https://explorer.testnet.pangea.web4.world'
);

const LEOSToken = new AntelopeToken(
    PangeaMainnetChain,
    'LEOS',
    'LEOS',
    6,
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/LEOS%20256x256.png?raw=true',
    'leos'
);

const LEOSTestnetToken = new AntelopeToken(
    PangeaTestnetChain,
    'TestnetLEOS',
    'LEOS',
    6,
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/LEOS%20256x256.png?raw=true',
    'leos-testnet'
);

const EOSJungleChain = new AntelopeChain(
    'https://jungle4.cryptolions.io',
    'EOS Jungle Testnet',
    '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
    'https://jungle3.bloks.io/img/chains/jungle.png',
    'https://jungle3.bloks.io'
);
const EOSJungleToken = new AntelopeToken(
    EOSJungleChain,
    'EOS',
    'EOS',
    4,
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/Pangea%20256x256.png?raw=true',
    'jungle'
);

EOSJungleChain.setNativeToken(EOSJungleToken);
PangeaMainnetChain.setNativeToken(LEOSToken);
PangeaTestnetChain.setNativeToken(LEOSTestnetToken);

const ANTELOPE_CHAIN_ID_TO_CHAIN: Record<string, AntelopeChain> = {};

ANTELOPE_CHAIN_ID_TO_CHAIN[PangeaMainnetChain.getAntelopeChainId()] = PangeaMainnetChain;
ANTELOPE_CHAIN_ID_TO_CHAIN[PangeaTestnetChain.getAntelopeChainId()] = PangeaTestnetChain;
ANTELOPE_CHAIN_ID_TO_CHAIN[EOSJungleChain.getAntelopeChainId()] = EOSJungleChain;

export {
    PangeaMainnetChain,
    PangeaTestnetChain,
    EOSJungleChain,
    LEOSToken,
    LEOSTestnetToken,
    EOSJungleToken as JUNGLEToken,
    ANTELOPE_CHAIN_ID_TO_CHAIN,
};

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
    async getArguments(): Promise<Record<string, string>> {
        const data = this.action.data;
        const args: Record<string, string> = {};

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];

                debug('getArguments()', key, value);

                if (value === null) {
                    args[key] = 'null';
                } else if (value === undefined) {
                    args[key] = 'undefined';
                } else if (typeof value === 'object') {
                    try {
                        args[key] = JSON.stringify(value);
                    } catch (error) {
                        console.error('getArguments() object', error);
                        args[key] = 'unpackable object';
                    }
                } else if (value.toString) {
                    args[key] = value.toString();
                } else {
                    try {
                        args[key] = JSON.stringify(value);
                    } catch (error) {
                        console.error('getArguments() value', error);
                        args[key] = 'unpackable value';
                    }
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
            return new Asset(this.chain.getNativeToken(), BigInt(0));
        }
    }
}

function getAssetFromQuantity(quantity: string, chain: AntelopeChain): IAsset {
    const name = quantity.split(' ')[1];
    const symbol = name;
    const precision = quantity.split(' ')[0].split('.')[1].length;
    const logoUrl = name === 'LEOS' ? LEOSToken.getLogoUrl() : '';

    const token = new AntelopeToken(chain, name, symbol, precision, logoUrl, '');
    const amountNumber = parseFloat(quantity.split(' ')[0]);
    const amount = BigInt(amountNumber * 10 ** precision);

    return new Asset(token, amount);
}

export class AntelopeTransaction implements ITransaction {
    private actions: ActionData[];
    protected chain: AntelopeChain;
    protected account: AntelopeAccount;

    constructor(actions: ActionData[], chain: AntelopeChain, account: AntelopeAccount) {
        this.actions = actions;
        this.chain = chain;
        this.account = account;
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
    async getArguments(): Promise<Record<string, string>> {
        throw new Error('Antelope transactions have multiple operations, call getOperations()');
    }
    async getValue(): Promise<Asset> {
        throw new Error('Antelope transactions have multiple operations, call getOperations()');
    }
    async getData(): Promise<ActionData[]> {
        return this.actions;
    }
    async estimateTransactionFee(): Promise<Asset> {
        return new Asset(this.chain.getNativeToken(), BigInt(0));
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
            return BigInt(a) + BigInt(b);
        }, BigInt(0));

        const estimatedFee = BigInt((await this.estimateTransactionFee()).getAmount());

        // Combine the total operation amounts with the estimated fee
        const amount = operationAmounts + estimatedFee;

        return new Asset(this.chain.getNativeToken(), amount);
    }
    hasMultipleOperations(): boolean {
        return true;
    }
    async getOperations(): Promise<IOperation[]> {
        return this.actions.map((action) => new AntelopeAction(action, this.chain));
    }
}
export class AntelopeAccount extends AbstractAccount implements IAccount {
    private privateKey?: AntelopePrivateKey;
    // @ts-expect-error chain overridden
    protected chain: AntelopeChain;

    private static getDidChainName(chain: AntelopeChain): string | null {
        switch (chain.getName()) {
            case 'Pangea':
                return 'pangea:';
            default:
                return null;
        }
    }
    constructor(chain: AntelopeChain, account: NameType, privateKey?: AntelopePrivateKey) {
        const nameString = Name.from(account).toString();
        const chainName = AntelopeAccount.getDidChainName(chain) ?? '';
        const did = `did:antelope:${chainName}${nameString}`;

        super(nameString, did, chain);
        this.privateKey = privateKey;
    }

    static fromAccount(chain: AntelopeChain, account: NameType): AntelopeAccount {
        return new AntelopeAccount(chain, account);
    }

    static fromAccountAndPrivateKey(
        chain: AntelopeChain,
        account: NameType,
        privateKey: AntelopePrivateKey
    ): AntelopeAccount {
        return new AntelopeAccount(chain, account, privateKey);
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

        return await this.privateKey.sendTransaction(data);
    }

    async isContract(): Promise<boolean> {
        try {
            const api = this.chain.getApiOrigin();
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
            console.log('error', error);
        }

        return false;
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
        // @ts-expect-error signatures type mismatch
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

            debug('approveTransactionRequest() callback', newCallback, bodyObject);
            const response = await fetch(newCallback, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyObject),
            });

            debug('approveTransactionRequest() response status', response.status);

            if (!response.ok || response.status !== 200) {
                console.error(`Failed to send callback: ${JSON.stringify(response)}`);
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
                console.error(`Failed to send callback: ${JSON.stringify(response)}`);
            }
        }
    }
}

export function getChainFromAntelopeChainId(chainId: string): AntelopeChain {
    if (!ANTELOPE_CHAIN_ID_TO_CHAIN[chainId]) throw new Error('Antelope chain not supported');
    return ANTELOPE_CHAIN_ID_TO_CHAIN[chainId];
}
