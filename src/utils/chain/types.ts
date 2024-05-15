import { TKeyType } from '@veramo/core';
import { IKey, IKeyManager } from '@veramo/core-types';

export type KeyFormat = string | 'hex' | 'base64' | 'base58' | 'wif';

export interface IPublicKey {
    getType(): Promise<TKeyType>;
    toString(format?: KeyFormat): Promise<string>;
}

export abstract class AbstractPublicKey implements IPublicKey {
    protected key: IKey;

    constructor(key: IKey) {
        this.key = { ...key };
        delete this.key.privateKeyHex;
    }

    protected async getKey(): Promise<IKey> {
        return this.key;
    }

    async getType(): Promise<TKeyType> {
        return (await this.getKey()).type;
    }

    async toString(format?: KeyFormat): Promise<string> {
        return (await this.getKey()).publicKeyHex;
    }
}

export interface IPrivateKey {
    getType(): Promise<TKeyType>;
    getPublicKey(): Promise<IPublicKey>;
    signTransaction(transaction: unknown): Promise<unknown>;
}

export abstract class AbstractPrivateKey implements IPrivateKey {
    protected abstract kid: string;
    protected abstract keyManager: IKeyManager;

    getKid(): string {
        return this.kid;
    }

    protected getKey(): Promise<IKey> {
        return this.getKeyManager().keyManagerGet({ kid: this.getKid() });
    }

    protected getKeyManager(): IKeyManager {
        return this.keyManager;
    }

    async getType(): Promise<TKeyType> {
        return (await this.getKey()).type;
    }

    abstract getPublicKey(): Promise<IPublicKey>;
    abstract signTransaction(transaction: unknown): Promise<unknown>;
}

export interface IChain {
    getName(): string;
    getChainId(): string;
    getLogoUrl(): string;
    // getApiEndpoint(): string;
    getNativeToken(): IToken;
}

export abstract class AbstractChain {
    protected abstract name: string;
    protected abstract chainId: string;
    protected abstract logoUrl: string;
    protected abstract nativeToken: IToken;

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
        return this.nativeToken;
    }
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
    abstract getUsdValue(): Promise<number>;
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
    // initialize from private key + optional account name
    fromPrivateKey(options: unknown): Promise<IAccount>;

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
    protected abstract nativeToken: IToken;

    // initialize from private key + optional account name
    abstract fromPrivateKey(options: unknown): Promise<IAccount>;

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
        return this.nativeToken;
    }
    abstract getTokens(): Promise<IToken[]>;
    getBalance(token: IToken): Promise<IAsset> {
        return token.getBalance(this);
    }
    abstract signTransaction(transaction: unknown): Promise<unknown>;
    abstract sendSignedTransaction(signedTransaction: unknown): Promise<unknown>;
    abstract sendTransaction(transaction: unknown): Promise<unknown>;
}
