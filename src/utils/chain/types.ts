import { TKeyType } from '@veramo/core';

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
        const price = await this.token.getUsdPrice();
        const usdValue = BigInt(this.amount) * BigInt(price) * BigInt(10) ** BigInt(this.token.getPrecision());

        return parseFloat(usdValue.toString());
    }
    getSymbol(): string {
        return this.token.getSymbol();
    }
    getPrecision(): number {
        return this.token.getPrecision();
    }
    printValue(): string {
        const value = this.amount / BigInt(10 ** this.token.getPrecision());

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
    getType(): Promise<TransactionType>;
    getFrom(): IAccount;
    getTo(): IAccount;
    getValue(): Promise<IAsset>;
    getFunction(): Promise<string>;
    getArguments(): Promise<Record<string, string>>;
    estimateTransactionFee(): Promise<IAsset>;
    estimateTransactionTotal(): Promise<IAsset>;
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
