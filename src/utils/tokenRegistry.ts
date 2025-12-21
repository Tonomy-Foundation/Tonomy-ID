import {
    EthereumAccount,
    EthereumChain,
    EthereumMainnetChain,
    EthereumPolygonChain,
    EthereumPrivateKey,
    EthereumSepoliaChain,
    ETHPolygonToken,
    ETHSepoliaToken,
    ETHToken,
} from './chain/etherum';
import {
    ANTELOPE_CHAIN_ID_TO_CHAIN,
    AntelopeAccount,
    AntelopeChain,
    AntelopePrivateKey,
    TONOLocalToken,
    TONOStagingToken,
    TONOTestnetToken,
    TONOToken,
    TonomyMainnetChain,
    TonomyTestnetChain,
    TonomyStagingChain,
    TonomyLocalChain,
} from './chain/antelope';
import { Asset, ChainType, IAccount, IChain, IPrivateKey, IToken } from './chain/types';
import { appStorage, assetStorage, keyStorage } from './StorageManager/setup';
import { EosioUtil, IUser, IUserBase } from '@tonomy/tonomy-id-sdk';
import settings from '../settings';
import Debug from './debug';
import Decimal from 'decimal.js';

const debug = Debug('tonomy-id:utils:tokenRegistry');

export interface AccountTokenDetails {
    chain: IChain;
    token: {
        balance: string;
        usdBalance: number;
        icon: string;
        symbol: string;
        name: string;
        isTransferable: boolean;
        precision: number;
    };
    account: string;
    privateKey: IPrivateKey;
}

export enum ChainKeyName {
    ethereum = 'ethereum',
    ethereumPolygon = 'ethereumPolygon',
    ethereumTestnetSepolia = 'ethereumTestnetSepolia',
    tonomyTono = 'tonomyTono',
    tonomyTestnetTono = 'tonomyTestnetTono',
    tonomyStagingTono = 'tonomyStagingTono',
    tonomyLocalTono = 'tonomyLocalTono',
}

export type TokenRegistryEntry = {
    token: IToken;
    chain: IChain;
    keyName: string;
};

async function addLocalChain() {
    const chainId = (await (await EosioUtil.getApi()).v1.chain.get_info()).chain_id;

    // @ts-expect-error antelopeChainId is protected
    TonomyLocalChain.antelopeChainId = chainId.toString();
    ANTELOPE_CHAIN_ID_TO_CHAIN[tonomyTokenEntry.chain.getAntelopeChainId()] = tonomyTokenEntry.chain;
}

export let tonomyTokenEntry: TokenRegistryEntry & { chain: AntelopeChain };

if (settings.env === 'production') {
    tonomyTokenEntry = { token: TONOToken, chain: TonomyMainnetChain, keyName: ChainKeyName.tonomyTono };
    ANTELOPE_CHAIN_ID_TO_CHAIN[tonomyTokenEntry.chain.getAntelopeChainId()] = tonomyTokenEntry.chain;
} else if (settings.env === 'testnet') {
    tonomyTokenEntry = {
        token: TONOTestnetToken,
        chain: TonomyTestnetChain,
        keyName: ChainKeyName.tonomyTestnetTono,
    };
    ANTELOPE_CHAIN_ID_TO_CHAIN[tonomyTokenEntry.chain.getAntelopeChainId()] = tonomyTokenEntry.chain;
} else if (settings.env === 'staging' || settings.env === 'development') {
    tonomyTokenEntry = {
        token: TONOStagingToken,
        chain: TonomyStagingChain,
        keyName: ChainKeyName.tonomyStagingTono,
    };
    debug('tonomyTokenEntry', tonomyTokenEntry.chain);
    ANTELOPE_CHAIN_ID_TO_CHAIN[tonomyTokenEntry.chain.getAntelopeChainId()] = tonomyTokenEntry.chain;
} else {
    tonomyTokenEntry = {
        token: TONOLocalToken,
        chain: TonomyLocalChain,
        keyName: ChainKeyName.tonomyLocalTono,
    };
    debug('tonomyTokenEntry', tonomyTokenEntry.chain);

    addLocalChain();
}

export const tokenRegistry: TokenRegistryEntry[] = [
    { token: ETHToken, chain: EthereumMainnetChain, keyName: ChainKeyName.ethereum },
    { token: ETHPolygonToken, chain: EthereumPolygonChain, keyName: ChainKeyName.ethereumPolygon },
    { token: ETHSepoliaToken, chain: EthereumSepoliaChain, keyName: ChainKeyName.ethereumTestnetSepolia },
];

// Uncomment out these lines to test the chain easily:
// tonomyTokenEntry.token.isTransferable = () => true;
// tonomyTokenEntry.chain.isTestnet = () => true;

if (tonomyTokenEntry.chain.isTestnet()) {
    tokenRegistry.push(tonomyTokenEntry);
} else {
    tokenRegistry.unshift(tonomyTokenEntry);
}

export async function getTokenEntryByChain(chain: string | IChain): Promise<TokenRegistryEntry> {
    const chainName = typeof chain === 'string' ? chain : chain.getName();
    const chainEntry = tokenRegistry.find((c) => c.chain.getName() === chainName);

    if (!chainEntry) throw new Error(`Unsupported chain ${chainName} from getAssetFromChain()`);
    return chainEntry;
}

export async function getKeyFromChain({ chain, keyName }: TokenRegistryEntry): Promise<IPrivateKey> {
    let key = await keyStorage.findByName(keyName, chain);

    if (!key) {
        const seed = await appStorage.getCryptoSeed();

        if (!seed) throw new Error(`Key not found for ${chain.getName()}`);
        key = await chain.createKeyFromSeed(seed);
        await keyStorage.emplaceKey(keyName, key);
    }

    return key;
}

export async function getKeyOrNullFromChain(chainEntry: TokenRegistryEntry): Promise<IPrivateKey | null> {
    try {
        return await getKeyFromChain(chainEntry);
    } catch (error) {
        if (error.message.startsWith('Key not found for')) return null;
        throw error;
    }
}

export async function getAccountFromChain(chainEntry: TokenRegistryEntry, user?: IUser): Promise<IAccount> {
    const { chain, token } = chainEntry;

    const asset = await assetStorage.findAssetByName(chainEntry.token);
    const key = await getKeyFromChain(chainEntry);

    let account: IAccount;

    if (chain.getChainType() === ChainType.ETHEREUM) {
        account = await EthereumAccount.fromPublicKey(
            chain as EthereumChain,
            await (key as EthereumPrivateKey).getPublicKey()
        );

        if (!asset) {
            await assetStorage.createAsset(new Asset(token, new Decimal(0)), account);
        }
    } else {
        if (!user) throw new Error('User is required for Antelope chain to get account name');
        debug(
            `getAccountFromChain() fetching Antelope account for ${chain.getName()}: ${await user.getAccountName()}, ${await key.exportPrivateKey()}`
        );

        account = await AntelopeAccount.fromAccountAndPrivateKey(
            chain as AntelopeChain,
            await user.getAccountName(),
            key as AntelopePrivateKey
        );
        debug(`getAccountFromChain() account: ${account.getChain().getName()}`);

        if (!asset) {
            await assetStorage.createAsset(new Asset(token, new Decimal(0)), account);
        }
    }

    return account;
}

export const getAssetDetails = async (chain: IChain): Promise<AccountTokenDetails> => {
    const tokenRegistry = await getTokenEntryByChain(chain);

    debug(`getAssetDetails() fetching asset for ${tokenRegistry.chain.getName()}`);
    const asset = await assetStorage.findAssetByName(tokenRegistry.token);

    if (!asset) throw new Error(`Asset not found for ${tokenRegistry.chain.getName()}`);
    const privateKey = await getKeyFromChain(tokenRegistry);

    return {
        chain: tokenRegistry.chain,
        token: {
            balance: asset.balance,
            usdBalance: asset.usdBalance,
            icon: tokenRegistry.token.getLogoUrl(),
            symbol: tokenRegistry.token.getSymbol(),
            name: tokenRegistry.token.getName(),
            isTransferable: tokenRegistry.token.isTransferable(),
            precision: tokenRegistry.token.getPrecision(),
        },
        account: asset.accountName,
        privateKey,
    };
};

export async function addNativeTokenToAssetStorage(user: IUserBase) {
    const accountName = await user.getAccountName();
    const privateKey = await getKeyFromChain(tonomyTokenEntry);

    const asset = new Asset(tonomyTokenEntry.token, new Decimal(0));
    const account = AntelopeAccount.fromAccountAndPrivateKey(
        tonomyTokenEntry.chain,
        accountName,
        privateKey as AntelopePrivateKey
    );

    await assetStorage.createAsset(asset, account);
}
