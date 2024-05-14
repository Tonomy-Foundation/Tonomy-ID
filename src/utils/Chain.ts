interface generatePrivateKeyFromPasswordAndChain {
    (password: string, chain: IChain): Promise<IPrivateKey>;
}

interface IPublicKey { }

interface IPrivateKey { }

interface IToken {
    getName(): string;
    getTicker(): string;
    getPrecision(): number;
    getUsdPrice(): Promise<number>;
    getContractAccount(): IAccount;
    getLogoUrl(): string;
    getAccount(): IAccount | undefined;
    getBalance(account?: IAccount): Promise<number>;
    getUsdValue(account?: IAccount): Promise<number>;
}

interface IChain {
    getName(): string;
    getChainId(): string;
    getLogoUrl(): string;
    getApiEndpoint(): string;
    getNativeToken(): IToken;
}

interface IAccount {
    getName(): string;
    getDid(): string;
    getPublicKey(): Promise<IPublicKey>;
    getPrivateKey(): Promise<IPrivateKey>;
    getChain(): IChain;
    getNativeToken(): IToken;
    getTokens(): Promise<IToken[]>;
    getBalance(token: IToken): Promise<number>;
    signData(data: string): Promise<string>;
    signVc(credential: object): Promise<object>;
    signTransaction(transaction: string): Promise<string>;
}
