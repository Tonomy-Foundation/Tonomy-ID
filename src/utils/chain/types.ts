import { Repository } from 'typeorm';

interface generateSeedFromPassword {
    (password: string, salt?: string): Promise<{ privateKey: string; salt: string }>;
}

interface generatePrivateKeyFromSeed {
    (seed: string, chain: IChain): Promise<IPrivateKey>;
}

export enum KeyType {
    'secpk1',
    'ed25519',
}

export enum KeyFormat {
    'pem',
    'jwk',
    'hex',
}

export interface IPublicKey {
    getType(): KeyType;
    toString(format?: KeyFormat): string;
}

export interface IPrivateKey {
    getType(): KeyType;
    toString(format?: KeyFormat): string;
    getPublicKey(): IPublicKey;
    signTransaction(transaction: unknown): Promise<unknown>;
}

export interface IChain {
    getName(): string;
    getChainId(): string;
    getLogoUrl(): string;
    getApiEndpoint(): string;
    getNativeToken(): IToken;
}

export abstract class AbstractChain {
    protected abstract name: string;
    protected abstract chainId: string;
    protected abstract logoUrl: string;
    protected abstract apiEndpoint: string;
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
    getApiEndpoint(): string {
        return this.apiEndpoint;
    }
    getNativeToken(): IToken {
        return this.nativeToken;
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
    getBalance(account?: IAccount): Promise<number>;
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
    abstract getBalance(account?: IAccount): Promise<number>;
    abstract getUsdValue(account?: IAccount): Promise<number>;
}

export interface IAccount {
    // initialize from private key + optional account name
    fromPrivateKey(options): Promise<IAccount>;

    getName(): string;
    getDid(): string;
    getChain(): IChain;
    getNativeToken(): IToken;
    getTokens(): Promise<IToken[]>;
    getBalance(token: IToken): Promise<number>;
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
    getValue(): Promise<number>;
    getFunction(): Promise<string>;
    getArguments(): Promise<Record<string, string>>;
    estimateTransactionFee(): Promise<number>;
    estimateTransactionTotal(): Promise<number>;
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
    getBalance(token: IToken): Promise<number> {
        return token.getBalance(this);
    }
    abstract signTransaction(transaction: unknown): Promise<unknown>;
    abstract sendSignedTransaction(signedTransaction: unknown): Promise<unknown>;
    abstract sendTransaction(transaction: unknown): Promise<unknown>;
}
