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
    ChainDetail,
} from './types';
import { SignClientTypes } from '@walletconnect/types';
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
import { IdentityV3 } from '@wharfkit/signing-request';

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

    async sendTransaction(data: ActionData[] | AntelopeTransaction): Promise<API.v1.PushTransactionResponse> {
        const transaction = await this.signTransaction(data);

        try {
            // const toPrint = data instanceof AntelopeTransaction ? await data.getData() : data;
            // console.log('sendTransaction()', JSON.stringify(toPrint, null, 2));
            return await this.chain.getApiClient().v1.chain.push_transaction(transaction);
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
    protected antelopeChainId: string;
    protected apiOrigin: string;
    private apiClient: APIClient;

    constructor(apiOrigin: string, name: string, antelopeChainId: string, logoUrl: string) {
        const chainId = 'antelope-' + antelopeChainId;

        super(name, chainId, logoUrl);
        this.antelopeChainId = antelopeChainId;
        this.apiOrigin = apiOrigin;
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
}

export const LEOS_SEED_ROUND_PRICE = 0.002;
export const LEOS_SEED_LATE_ROUND_PRICE = 0.004;
export const LEOS_PUBLIC_SALE_PRICE = 0.012;

export class AntelopeToken extends AbstractToken implements IToken {
    protected coinmarketCapId: string;
    // @ts-expect-error chain overridden
    protected chain: AntelopeChain;

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
        return this.chain;
    }
    async getUsdPrice(): Promise<number> {
        console.log('his.getChain()', this.getChain());
        return LEOS_PUBLIC_SALE_PRICE;

        // switch (this.getChain().getName()) {
        //     case 'Pangea':
        //         return LEOS_PUBLIC_SALE_PRICE;
        //     case 'Pangea Testnet':
        //         return LEOS_PUBLIC_SALE_PRICE;
        //     case 'EOS Jungle Testnet':
        //         return LEOS_PUBLIC_SALE_PRICE;
        //     default:
        //         throw new Error('Unsupported Antelope chain');
        // }
    }

    getContractAccount(): IAccount {
        return AntelopeAccount.fromAccount(this.getChain(), 'eosio.token');
    }

    async getBalance(account?: IAccount): Promise<Asset> {
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
        const asset = assets.find((asset) => asset.symbol.code.equals(this.toAntelopeSymbol()));

        if (!asset) return new Asset(this, BigInt(0));
        return new Asset(this, BigInt(asset.units.value));
    }

    toAntelopeSymbol(): AntelopeAsset.Symbol {
        return AntelopeAsset.Symbol.fromParts(this.getSymbol(), this.getPrecision());
    }

    async getUsdValue(account?: IAccount): Promise<number> {
        const balance = await this.getBalance(account);

        return balance.getUsdValue();
    }
}

const PangeaMainnetChain = new AntelopeChain(
    'https://pangea.eosusa.io',
    'Pangea',
    '66d565f72ac08f8321a3036e2d92eea7f96ddc90599bdbfc2d025d810c74c248',
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/Pangea%20256x256.png?raw=true'
);

const PangeaTestnetChain = new AntelopeChain(
    'https://pangea.test.eosusa.io',
    'Pangea Testnet',
    '8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f',
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/Pangea%20256x256.png?raw=true'
);

const LEOSToken = new AntelopeToken(
    PangeaMainnetChain,
    'LEOS',
    'LEOS',
    6,
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/LEOS%20256x256.png?raw=true',
    'ethereum'
);

const LEOSTestnetToken = new AntelopeToken(
    PangeaTestnetChain,
    'LEOS',
    'LEOS',
    6,
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/LEOS%20256x256.png?raw=true',
    'ethereum'
);

const EOSJungleChain = new AntelopeChain(
    'https://jungle4.cryptolions.io',
    'EOS Jungle Testnet',
    '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/Pangea%20256x256.png?raw=true'
);
const JUNGLEToken = new AntelopeToken(
    EOSJungleChain,
    'JUNGLE',
    'JUNGLE',
    4,
    'https://github.com/Tonomy-Foundation/documentation/blob/master/images/logos/Pangea%20256x256.png?raw=true',
    'jungle'
);

EOSJungleChain.setNativeToken(JUNGLEToken);
PangeaMainnetChain.setNativeToken(LEOSToken);
PangeaTestnetChain.setNativeToken(LEOSTestnetToken);

export { PangeaMainnetChain, PangeaTestnetChain, EOSJungleChain, LEOSToken, LEOSTestnetToken, JUNGLEToken };

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
            this.action.name.toString() === 'transfer'
            //  &&
            // this.action.account.toString() === this.chain.getNativeToken().getContractAccount()?.getName().toString()
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
        return this.action.data;
    }
    async getFunction(): Promise<string> {
        return this.action.name.toString();
    }
    async getValue(): Promise<Asset> {
        // TODO: need to also handle token transfers on other contracts

        if ((await this.getType()) === TransactionType.TRANSFER) {
            return new Asset(this.chain.getNativeToken(), this.action.data.quantity);
        } else {
            return new Asset(this.chain.getNativeToken(), BigInt(0));
        }
    }
}

export class AntelopeTransaction implements ITransaction {
    private actions: ActionData[];
    private type?: TransactionType;
    protected chain: AntelopeChain;
    // protected session: EthereumChainSession;

    constructor(actions: ActionData[], chain: AntelopeChain) {
        this.actions = actions;
        this.chain = chain;
    }
    getChain(): AntelopeChain {
        return this.chain;
    }

    static fromActions(actions: ActionData[], chain: AntelopeChain): AntelopeTransaction {
        return new AntelopeTransaction(actions, chain);
    }

    async getType(): Promise<TransactionType> {
        throw new Error('Antelope transactions have multiple operations, call getOperations()');
    }
    async getFrom(): Promise<AntelopeAccount> {
        throw new Error('Antelope transactions have multiple operations, call getOperations()');
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

        const operationAmounts = (await Promise.all(operationAmountsPromises)).reduce((a, b) => a + b, BigInt(0));
        let amount = operationAmounts + (await this.estimateTransactionFee()).getAmount();

        if (typeof amount === 'string') {
            const numericPart = amount.match(/\d+(\.\d+)?/)[0];
            // Remove any non-numeric characters (if necessary)
            const cleanedNumericPart = numericPart.replace(/\D/g, '');

            // Convert to BigInt
            amount = BigInt(cleanedNumericPart);
        }

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

    async sendTransaction(data: ActionData[] | AntelopeTransaction): Promise<API.v1.PushTransactionResponse> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        return this.privateKey.sendTransaction(data);
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

export class ESRSession implements IChainSession {
    async createSession(request: unknown): Promise<void> {}

    async disconnectSession(): Promise<void> {
        // Logic to disconnect the ESR session
        // Example: Clear the session and any stored data
    }

    async getActiveAccounts(): Promise<ChainDetail[]> {
        return [{ chainId: 'string', address: 'string', networkName: 'string' }];
    }

    async createTransactionRequest(request: unknown): Promise<void> {
        // Logic to create a transaction request using ESR
        // Example: Generate a transaction from the ESR and prepare it for signing
    }

    async approveRequest(request: unknown): Promise<void> {
        // Logic to approve an ESR transaction request
        // Example: Sign the ESR transaction request and finalize it
    }

    async rejectRequest(request: unknown): Promise<void> {
        // Logic to reject an ESR transaction request
        // Example: Invalidate the ESR transaction request and notify the user
    }
}
