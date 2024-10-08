import { TKeyType } from '@veramo/core';
import { formatCurrencyValue } from '../numbers';

export type KeyFormat = 'hex' | 'base64' | 'base58' | 'wif';
export interface IPublicKey {
    getType(): Promise<TKeyType>;
    toString(format?: KeyFormat): Promise<string>;
}

export abstract class AbstractPublicKey implements IPublicKey {
    protected publicKeyHex: string;
    protected type: TKeyType;

    constructor(publicKeyHex: string, type: TKeyType) {
        this.publicKeyHex = publicKeyHex;
        this.type = type;
    }

    async getType(): Promise<TKeyType> {
        return this.type;
    }

    async toString(format?: KeyFormat): Promise<string> {
        if (format && format !== 'hex') throw new Error('Unsupported format');
        return this.publicKeyHex;
    }
}

export interface ITransactionReceipt {
    getChain(): IChain;
    getFee(): Promise<IAsset>;
    getTransactionHash(): string;
    getExplorerUrl(): string;
    getTimestamp(): Promise<Date>;
    getRawReceipt(): unknown;
}

export abstract class AbstractTransactionReceipt implements ITransactionReceipt {
    protected chain: IChain;

    constructor(chain: IChain) {
        this.chain = chain;
    }

    getChain(): IChain {
        return this.chain;
    }

    abstract getFee(): Promise<IAsset>;
    abstract getTransactionHash(): string;
    abstract getExplorerUrl(): string;
    abstract getTimestamp(): Promise<Date>;
    abstract getRawReceipt(): unknown;
}

export interface IPrivateKey {
    getType(): Promise<TKeyType>;
    getPublicKey(): Promise<IPublicKey>;
    signTransaction(transaction: unknown): Promise<unknown>;
    exportPrivateKey(): Promise<string>;
    sendTransaction(transaction: unknown): Promise<ITransactionReceipt>;
}

export abstract class AbstractPrivateKey implements IPrivateKey {
    protected privateKeyHex: string;
    protected type: TKeyType;

    constructor(privateKeyHex: string, type: TKeyType) {
        this.privateKeyHex = privateKeyHex;
        this.type = type;
    }

    async getType(): Promise<TKeyType> {
        return this.type;
    }

    abstract getPublicKey(): Promise<IPublicKey>;
    abstract signTransaction(transaction: unknown): Promise<unknown>;
    abstract sendTransaction(transaction: unknown): Promise<ITransactionReceipt>;
    async exportPrivateKey(): Promise<string> {
        return this.privateKeyHex;
    }
}

export interface ExplorerOptions {
    transactionHash?: string;
    accountName?: string;
}

export interface IChain {
    getChainType(): ChainType;
    getName(): string;
    getChainId(): string;
    getLogoUrl(): string;
    getNativeToken(): IToken;
    createKeyFromSeed(seed: string): IPrivateKey;
    formatShortAccountName(account: string): string;
    getExplorerUrl(options?: ExplorerOptions): string;
}

export enum ChainType {
    'ETHEREUM' = 'ETHEREUM',
    'ANTELOPE' = 'ANTELOPE',
}

export abstract class AbstractChain implements IChain {
    protected chainType: ChainType;
    protected name: string;
    protected chainId: string;
    protected logoUrl: string;
    protected nativeToken?: IToken;

    constructor(name: string, chainId: string, logoUrl: string) {
        this.name = name;
        this.chainId = chainId;
        this.logoUrl = logoUrl;
    }
    setNativeToken(token: IToken): void {
        this.nativeToken = token;
    }
    getName(): string {
        return this.name;
    }
    getChainId(): string {
        return this.chainId;
    }
    getLogoUrl(): string {
        return this.logoUrl;
    }
    getNativeToken(): IToken {
        if (!this.nativeToken) throw new Error('Native token not set');
        return this.nativeToken;
    }
    getChainType(): ChainType {
        return this.chainType;
    }
    abstract createKeyFromSeed(seed: string): IPrivateKey;
    abstract formatShortAccountName(account: string): string;
    abstract getExplorerUrl(options?: ExplorerOptions): string;
}

export interface IAsset {
    getToken(): IToken;
    getAmount(): bigint;
    getUsdValue(): Promise<number>;
    getSymbol(): string;
    getPrecision(): number;
    toString(precision?: number): string;
    /*
    gt(other: IAsset): boolean;
    gte(other: IAsset): boolean;
    lt(other: IAsset): boolean;
    lte(other: IAsset): boolean;
    eq(other: IAsset): boolean;
    add(other: IAsset): IAsset;
    sub(other: IAsset): IAsset;
    mul(other: IAsset): IAsset;
    div(other: IAsset): IAsset;
    */
}

export abstract class AbstractAsset implements IAsset {
    protected abstract token: IToken;
    protected abstract amount: bigint;

    getToken(): IToken {
        return this.token;
    }
    getAmount(): bigint {
        return this.amount;
    }

    async getUsdValue(): Promise<number> {
        const price = await this.token.getUsdPrice();

        if (price) {
            // Use a higher precision for the multiplier to ensure small values are accurately represented
            const precisionMultiplier = BigInt(10) ** BigInt(18); // Adjusted precision

            const tokenPrecisionMultiplier = BigInt(10) ** BigInt(this.token.getPrecision());

            // Convert price to a BigInteger without losing precision
            const priceBigInt = BigInt(Math.round(price * parseFloat((BigInt(10) ** BigInt(18)).toString()))); // Use consistent high precision

            // Adjust the amount to match the high precision multiplier

            const adjustedAmount = (BigInt(this.amount) * precisionMultiplier) / tokenPrecisionMultiplier;

            // Calculate usdValue using BigInt for accurate arithmetic operations
            const usdValueBigInt = (adjustedAmount * priceBigInt) / precisionMultiplier;

            // Convert the result back to a floating-point number with controlled precision
            const usdValue = parseFloat(usdValueBigInt.toString()) / parseFloat(precisionMultiplier.toString());

            // Ensure the result is formatted to a fixed number of decimal places without rounding issues
            return parseFloat(usdValue.toFixed(10));
        } else {
            return 0;
        }
    }
    getSymbol(): string {
        return this.token.getSymbol();
    }
    getPrecision(): number {
        return this.token.getPrecision();
    }
    printValue(precision?: number): string {
        const amountNumber = Number(this.amount);
        const precisionNumber = Number(10 ** this.token.getPrecision());

        // Perform the division
        const value = parseFloat((amountNumber / precisionNumber).toFixed(precision ?? this.getPrecision()));

        return formatCurrencyValue(value, precision ?? this.getPrecision());
    }

    toString(precision?: number): string {
        return `${this.printValue(precision)} ${this.token.getSymbol()}`;
    }
}

export interface IToken {
    // initialize with an account to easily get balance and usd value
    setAccount(account: IAccount): IToken;

    getName(): string;
    getSymbol(): string;
    getPrecision(): number;
    getChain(): IChain;
    getUsdPrice(): Promise<number>;
    getContractAccount(): IAccount | undefined;
    getLogoUrl(): string;
    getAccount(): IAccount | undefined;
    getBalance(account?: IAccount): Promise<IAsset>;
    getUsdValue(account?: IAccount): Promise<number>;
}

export abstract class AbstractToken implements IToken {
    protected account?: IAccount;
    protected name: string;
    protected symbol: string;
    protected precision: number;
    protected chain: IChain;
    protected logoUrl: string;

    constructor(name: string, symbol: string, precision: number, chain: IChain, logoUrl: string) {
        this.name = name;
        this.symbol = symbol;
        this.precision = precision;
        this.chain = chain;
        this.logoUrl = logoUrl;
    }

    setAccount(account: IAccount): IToken {
        this.account = account;
        return this;
    }
    getName(): string {
        return this.name;
    }
    getSymbol(): string {
        return this.symbol;
    }
    getPrecision(): number {
        return this.precision;
    }
    getChain(): IChain {
        return this.chain;
    }
    abstract getUsdPrice(): Promise<number>;
    abstract getContractAccount(): IAccount | undefined;
    getLogoUrl(): string {
        return this.logoUrl;
    }
    getAccount(): IAccount | undefined {
        return this.account;
    }
    abstract getBalance(account?: IAccount): Promise<IAsset>;
    abstract getUsdValue(account?: IAccount): Promise<number>;
}

export interface IAccount {
    getName(): string;
    getDid(): string;
    getChain(): IChain;
    getNativeToken(): IToken;
    getTokens(): Promise<IToken[]>;
    getBalance(token: IToken): Promise<IAsset>;
    signTransaction(transaction: unknown): Promise<unknown>;
    sendTransaction(transaction: unknown): Promise<unknown>;
}

export enum TransactionType {
    'CONTRACT' = 'CONTRACT',
    'TRANSFER' = 'TRANSFER',
    'BOTH' = 'BOTH',
}

export interface IOperation {
    getType(): Promise<TransactionType>;
    getFrom(): Promise<IAccount>;
    getTo(): Promise<IAccount>;
    getValue(): Promise<IAsset>;
    getFunction(): Promise<string>;
    getArguments(): Promise<Record<string, string>>;
}

export interface ITransaction extends IOperation {
    getChain(): IChain;
    estimateTransactionFee(): Promise<IAsset>;
    estimateTransactionTotal(): Promise<IAsset>;
    hasMultipleOperations(): boolean;
    getOperations(): Promise<IOperation[]>;
    // Returns the chain specific transaction object
    // Antelope = ActionData[]
    // Ethereum = TransactionRequest
    getData(): Promise<unknown>;
}

export abstract class AbstractAccount implements IAccount {
    protected name: string;
    protected did: string;
    protected chain: IChain;

    constructor(name: string, did: string, chain: IChain) {
        this.name = name;
        this.did = did;
        this.chain = chain;
    }

    getName(): string {
        return this.name;
    }
    getDid(): string {
        return this.did;
    }
    getChain(): IChain {
        return this.chain;
    }
    getNativeToken(): IToken {
        return this.chain.getNativeToken();
    }
    abstract getTokens(): Promise<IToken[]>;
    getBalance(token: IToken): Promise<IAsset> {
        return token.getBalance(this);
    }
    abstract signTransaction(transaction: unknown): Promise<unknown>;
    abstract sendTransaction(transaction: unknown): Promise<unknown>;
}

export class Asset extends AbstractAsset {
    protected token: IToken;
    protected amount: bigint;

    constructor(token: IToken, amount: bigint) {
        super();
        this.token = token;
        this.amount = amount;
    }
}

export interface IChainSession {
    createSession(request: unknown): Promise<void>;
    cancelSessionRequest(request: unknown): Promise<void>;

    createTransactionRequest(request: unknown): Promise<unknown>;
    approveTransactionRequest(request: unknown, transaction: ITransactionReceipt): Promise<void>;
    rejectTransactionRequest(request: unknown): Promise<void>;
    getActiveAccounts(): Promise<IAccount[]>;
}
