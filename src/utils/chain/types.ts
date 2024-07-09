import { TKeyType } from '@veramo/core';
import { SessionTypes } from '@walletconnect/types';

export type KeyFormat = string | 'hex' | 'base64' | 'base58' | 'wif';
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
        return this.publicKeyHex;
    }
}

export interface IPrivateKey {
    getType(): Promise<TKeyType>;
    getPublicKey(): Promise<IPublicKey>;
    signTransaction(transaction: unknown): Promise<unknown>;
    exportPrivateKey(): Promise<string>;
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
    async exportPrivateKey(): Promise<string> {
        return this.privateKeyHex;
    }
}

export interface IChain {
    getName(): string;
    getChainId(): string;
    getLogoUrl(): string;
    // getApiEndpoint(): string;
    getNativeToken(): IToken;
    createKeyFromSeed(seed: string): IPrivateKey;
    formatShortAccountName(account: string): string;
}

export abstract class AbstractChain implements IChain {
    protected abstract name: string;
    protected abstract chainId: string;
    protected abstract logoUrl: string;
    protected abstract nativeToken?: IToken;

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
    abstract createKeyFromSeed(seed: string): IPrivateKey;
    abstract formatShortAccountName(account: string): string;
}

export interface IAsset {
    getToken(): IToken;
    getAmount(): bigint;
    getUsdValue(): Promise<number>;
    getSymbol(): string;
    getPrecision(): number;
    toString(): string;
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
        const price = await this.token.getUsdPrice(); // Step 1

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
        return parseFloat(usdValue.toFixed(10)); // Adjust the number of decimal places as needed
    }
    getSymbol(): string {
        return this.token.getSymbol();
    }
    getPrecision(): number {
        return this.token.getPrecision();
    }
    printValue(): string {
        const amountNumber = Number(this.amount);
        const precisionNumber = Number(10 ** this.token.getPrecision());

        // Perform the division
        const value = amountNumber / precisionNumber;

        return value.toString();
    }

    toString(): string {
        return `${this.printValue()} ${this.token.getSymbol()}`;
    }
}

export interface IToken {
    // initialize with an account to easily get balance and usd value
    withAccount(account: IAccount): IToken;

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
    protected abstract name: string;
    protected abstract symbol: string;
    protected abstract precision: number;
    protected abstract chain: IChain;
    protected abstract logoUrl: string;

    withAccount(account: IAccount): IToken {
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
    sendSignedTransaction(signedTransaction: unknown): Promise<unknown>;
    sendTransaction(transaction: unknown): Promise<unknown>;
}

export enum TransactionType {
    'contract',
    'transfer',
    'both',
}

export interface ITransaction {
    getChain(): IChain;
    getType(): Promise<TransactionType>;
    getFrom(): IAccount;
    getTo(): IAccount;
    getValue(): Promise<IAsset>;
    getFunction(): Promise<string>;
    getArguments(): Promise<Record<string, string>>;
    estimateTransactionFee(): Promise<IAsset>;
    estimateTransactionTotal(): Promise<IAsset>;
    getData(): Promise<string>;
}

export abstract class AbstractAccount implements IAccount {
    protected abstract name: string;
    protected abstract did: string;
    protected abstract chain: IChain;

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
    abstract sendSignedTransaction(signedTransaction: unknown): Promise<unknown>;
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
    getId(): number;
    getName(): string;
    getUrl(): string;
    getIcons(): string | null;
}

export interface ISession {
    origin: string;
    id: number;
    topic: string;
}
