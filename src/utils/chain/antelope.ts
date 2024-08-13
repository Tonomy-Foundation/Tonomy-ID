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
import { SignClientTypes } from '@walletconnect/types';
import {
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
    SignedTransaction,
    Transaction,
} from '@wharfkit/antelope';
import { GetInfoResponse } from '@wharfkit/antelope/src/api/v1/types';

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

    async signTransaction(actions: ActionData[]): Promise<SignedTransaction> {
        // Get the ABI(s) of all contracts
        const api = await this.chain.getApiClient();
        const uniqueContracts = [...new Set(actions.map((data) => data.account))];
        const abiPromises = uniqueContracts.map((contract) => api.v1.chain.get_abi(contract));
        const abiArray = await Promise.all(abiPromises);
        const abiMap = new Map(abiArray.map((abi) => [abi.account_name, abi.abi]));

        // Create the action data
        const actionData: Action[] = [];

        actions.forEach((data) => {
            const abi = abiMap.get(data.account.toString());

            actionData.push(Action.from(data, abi));
        });

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

    async sendTransaction(actions: ActionData[]): Promise<API.v1.PushTransactionResponse> {
        const transaction = await this.signTransaction(actions);

        return await this.chain.getApiClient().v1.chain.push_transaction(transaction);
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
    protected declare chain: AntelopeChain;

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
        switch (this.getChain().getName()) {
            case 'Pangea':
                return LEOS_PUBLIC_SALE_PRICE;
            case 'Pangea Testnet':
                return LEOS_PUBLIC_SALE_PRICE;
            default:
                throw new Error('Unsupported Antelope chain');
        }
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

PangeaMainnetChain.addToken(LEOSToken);
PangeaTestnetChain.addToken(LEOSTestnetToken);

export { PangeaMainnetChain, PangeaTestnetChain, LEOSToken, LEOSTestnetToken };

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

    static async fromActions(actions: ActionData[], chain: AntelopeChain): Promise<AntelopeTransaction> {
        return new AntelopeTransaction(actions, chain);
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
}

export class AntelopeAccount extends AbstractAccount implements IAccount {
    private privateKey?: AntelopePrivateKey;
    protected declare chain: AntelopeChain;

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

    async signTransaction(actions: ActionData[]): Promise<SignedTransaction> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        return this.privateKey.signTransaction(actions);
    }

    async sendTransaction(actions: ActionData[]): Promise<API.v1.PushTransactionResponse> {
        if (!this.privateKey) {
            throw new Error('Account has no private key');
        }

        return this.privateKey.sendTransaction(actions);
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
                    account_name: this.getName(),
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
