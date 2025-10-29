import { TKeyType } from '@veramo/core';
import { formatTokenValue } from '../numbers';
import Web3Wallet from '@walletconnect/web3wallet';
import { sha256, StakingAccountState } from '@tonomy/tonomy-id-sdk';
import { navigate } from '../navigate';
import { KeyValue } from '../strings';
import Decimal from 'decimal.js';
import { PushTransactionResponse } from '@wharfkit/antelope/src/api/v1/types';
import { Signer } from '@tonomy/tonomy-id-sdk';

export type KeyFormat = 'hex' | 'base64' | 'base58' | 'wif';

export interface VestedAllocation {
    totalAllocation: number;
    unlockable: number;
    unlocked: number;
    locked: number;
    vestingStart: Date;
    vestingPeriod: string;
    unlockAtVestingStart: number;
    allocationDate: Date;
    categoryId: number;
}

export interface VestedTokens {
    totalAllocation: number;
    unlockable: number;
    unlocked: number;
    locked: number;
    allocationsDetails: VestedAllocation[];
}

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
    isValidAccountName(account: string): boolean;
    isTestnet(): boolean;
}

export enum ChainType {
    'ETHEREUM' = 'ETHEREUM',
    'ANTELOPE' = 'ANTELOPE',
}

export enum PlatformType {
    'MOBILE' = 'MOBILE',
    'BROWSER' = 'BROWSER',
}

export abstract class AbstractChain implements IChain {
    protected chainType: ChainType;
    protected name: string;
    protected chainId: string;
    protected logoUrl: string;
    protected nativeToken?: IToken;
    protected testnet = false;

    constructor(name: string, chainId: string, logoUrl: string, testnet = false) {
        this.name = name;
        this.chainId = chainId;
        this.logoUrl = logoUrl;
        this.testnet = testnet;
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
    isTestnet(): boolean {
        return this.testnet;
    }
    protected generateUniqueSeed(seed: string): string {
        return sha256(seed + this.getChainId());
    }
    abstract createKeyFromSeed(seed: string): IPrivateKey;
    abstract formatShortAccountName(account: string): string;
    abstract getExplorerUrl(options?: ExplorerOptions): string;
    abstract isValidAccountName(account: string): boolean;
}

export interface IAsset {
    getToken(): IToken;
    getAmount(): Decimal;
    getUsdValue(): Promise<number>;
    getSymbol(): string;
    getPrecision(): number;
    toString(precision?: number): string;
    add(other: IAsset): IAsset;
    /*
    gt(other: IAsset): boolean;
    gte(other: IAsset): boolean;
    lt(other: IAsset): boolean;
    lte(other: IAsset): boolean;
    eq(other: IAsset): boolean;
    sub(other: IAsset): IAsset;
    mul(other: IAsset): IAsset;
    div(other: IAsset): IAsset;
    */
}

export abstract class AbstractAsset implements IAsset {
    protected abstract token: IToken;
    protected abstract amount: Decimal;

    getToken(): IToken {
        return this.token;
    }
    getAmount(): Decimal {
        return this.amount;
    }
    add(other: IAsset): IAsset {
        if (!this.token.eq(other.getToken())) throw new Error('Different tokens');
        return new Asset(this.token, this.amount.add(other.getAmount()));
    }

    async getUsdValue(): Promise<number> {
        const price = await this.token.getUsdPrice();

        if (price) {
            const priceDecimal = new Decimal(price);
            const usdValue = this.amount.mul(priceDecimal);

            return usdValue.toNumber();
        }

        return 0;
    }

    getSymbol(): string {
        return this.token.getSymbol();
    }
    getPrecision(): number {
        return this.token.getPrecision();
    }

    printValue(precision?: number): string {
        if (precision) {
            return this.amount.toFixed(precision);
        } else {
            return formatTokenValue(this.amount);
        }
    }

    toString(precision?: number): string {
        return `${this.printValue(precision)} ${this.token.getSymbol()}`;
    }
}

export interface IToken {
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
    isTransferable(): boolean;
    isVestable(): boolean;
    isStakeable(): boolean;
    eq(other: IToken): boolean;
    getVestedTokens(account: IAccount): Promise<VestedTokens>;
    getAvailableBalance(account?: IAccount): Promise<IAsset>;
    getVestedTotalBalance(account?: IAccount): Promise<IAsset>;
    withdrawVestedTokens(account: IAccount, accountSigner: Signer): Promise<PushTransactionResponse>;
    getAccountStateData(account: IAccount): Promise<StakingAccountState>;
    stakeTokens(account: IAccount, amount: string, accountSigner: Signer): Promise<PushTransactionResponse>;
    unStakeTokens(account: IAccount, allocationId: number, accountSigner: Signer): Promise<PushTransactionResponse>;
    getCalculatedYield(amount: number): Promise<number>;
}

export abstract class AbstractToken implements IToken {
    protected account?: IAccount;
    protected name: string;
    protected symbol: string;
    protected precision: number;
    protected chain: IChain;
    protected logoUrl: string;
    protected transferable = true;
    protected vestable = false;
    protected stakeable = false;

    constructor(
        name: string,
        symbol: string,
        precision: number,
        chain: IChain,
        logoUrl: string,
        transferable = true,
        vestable = false,
        stakeable = false
    ) {
        this.name = name;
        this.symbol = symbol;
        this.precision = precision;
        this.chain = chain;
        this.logoUrl = logoUrl;
        this.transferable = transferable;
        this.vestable = vestable;
        this.stakeable = stakeable;
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
    isTransferable(): boolean {
        return this.transferable;
    }
    isVestable(): boolean {
        return this.vestable;
    }
    isStakeable(): boolean {
        return this.stakeable;
    }
    eq(other: IToken): boolean {
        return (
            this.getName() === other.getName() &&
            this.getSymbol() === other.getSymbol() &&
            this.getPrecision() === other.getPrecision()
        );
    }
    abstract getBalance(account?: IAccount): Promise<IAsset>;
    abstract getUsdValue(account?: IAccount): Promise<number>;
    abstract getAvailableBalance(account?: IAccount): Promise<IAsset>;

    async getVestedTokens(account: IAccount): Promise<VestedTokens> {
        throw new Error(`getVestedTokens() method not implemented' ${account}`);
    }

    async getVestedTotalBalance(): Promise<IAsset> {
        throw new Error(`getVestedTotalBalance() method not implemented'`);
    }
    async withdrawVestedTokens(account: IAccount, accountSigner: Signer): Promise<PushTransactionResponse> {
        throw new Error(`withdrawVestedTokens() method not implemented' ${account} ${accountSigner}`);
    }
    async getAccountStateData(account: IAccount): Promise<StakingAccountState> {
        throw new Error(`getAccountStateData() method not implemented' ${account}`);
    }

    async stakeTokens(account: IAccount, amount: string, accountSigner: Signer): Promise<PushTransactionResponse> {
        throw new Error(`stakeTokens() method not implemented' ${account} ${amount} ${accountSigner}`);
    }

    async unStakeTokens(
        account: IAccount,
        allocationId: number,
        accountSigner: Signer
    ): Promise<PushTransactionResponse> {
        throw new Error(`unStakeTokens() method not implemented' ${account} ${allocationId} ${accountSigner}`);
    }
    async getCalculatedYield(amount: number): Promise<number> {
        throw new Error(`getCalculatedYield() method not implemented' ${amount}`);
    }
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
    getArguments(): Promise<KeyValue>;
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
    getExpiration(): Date | null;
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
    protected amount: Decimal;

    constructor(token: IToken, amount: Decimal) {
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

export interface ILoginApp {
    getLogoUrl(): string;
    getName(): string;
    getChains(): IChain[];
    getOrigin(): string;
    getUrl(): string;
}

export class LoginApp implements ILoginApp {
    name: string;
    url: string;
    icons: string;
    chains: IChain[];
    origin: string;

    constructor(name: string, url: string, icons: string, chains: IChain[]) {
        this.name = name;
        this.url = url;
        this.icons = icons;
        this.chains = chains;
        this.origin = new URL(url).origin;
    }
    getLogoUrl(): string {
        return this.icons;
    }
    getName(): string {
        return this.name;
    }
    getChains(): IChain[] {
        return this.chains;
    }
    getOrigin(): string {
        return this.origin;
    }
    getUrl(): string {
        return this.url;
    }
}

export interface ILoginRequest {
    session?: ISession;
    loginApp: ILoginApp;
    privateKey?: IPrivateKey;
    account: IAccount[];
    request?: unknown;
    reject(): Promise<void>;
    approve(): Promise<void>;
}

export interface ITransactionRequest {
    session?: ISession;
    transaction: ITransaction;
    privateKey: IPrivateKey;
    account: IAccount;
    request?: unknown;
    getOrigin(): string | null;
    reject(): Promise<void>;
    approve(): Promise<ITransactionReceipt>;
}

export interface ISession {
    web3wallet?: Web3Wallet;
    initialize(): Promise<void>;
    onQrScan(data: string): Promise<void>; // make this function static
    onLink(data: string): Promise<void>; // make this function static
    onEvent(request: unknown): Promise<void>;
}

export abstract class AbstractSession implements ISession {
    abstract initialize(): Promise<void>;
    abstract onQrScan(data: string): Promise<void>;
    abstract onLink(data: string): Promise<void>;
    abstract onEvent(request?: unknown): Promise<void>;

    protected abstract handleLoginRequest(request: unknown): Promise<void>;
    protected abstract handleTransactionRequest(request: unknown): Promise<void>;
    protected async navigateToTransactionScreen(request: ITransactionRequest): Promise<void> {
        navigate('SignTransaction', {
            request,
        });
    }

    protected async navigateToLoginScreen(request: ILoginRequest): Promise<void> {
        navigate('WalletConnectLogin', { loginRequest: request });
    }
}
