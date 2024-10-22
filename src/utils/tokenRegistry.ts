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
    LEOSLocalToken,
    LEOSStagingToken,
    LEOSTestnetToken,
    LEOSToken,
    PangeaLocalChain,
    PangeaMainnetChain,
    PangeaStagingChain,
    PangeaTestnetChain,
} from './chain/antelope';
import { Asset, ChainType, IAccount, IChain, IPrivateKey, IToken } from './chain/types';
import { assetStorage, keyStorage } from './StorageManager/setup';
import { AssetStorage } from './StorageManager/repositories/assetStorageManager';
import { EosioUtil, IUser } from '@tonomy/tonomy-id-sdk';
import settings from '../settings';

export interface AccountDetails {
    network: string;
    account: string;
    balance: string;
    usdBalance: number;
    icon: string;
    symbol: string;
    testnet: boolean;
    isTransferable: boolean;
    privateKey: IPrivateKey;
    chain: IChain;
}

export enum ChainKeyName {
    ethereum = 'ethereum',
    ethereumPolygon = 'ethereumPolygon',
    ethereumTestnetSepolia = 'ethereumTestnetSepolia',
    pangeaLeos = 'pangeaLeos',
    pangeaTestnetLeos = 'pangeaTestnetLeos',
    pangeaStagingLeos = 'pangeaStagingLeos',
    pangeaLocalLeos = 'pangeaLocalLeos',
}

export type TokenRegistryEntry = {
    token: IToken;
    chain: IChain;
    keyName: string;
};

export const tokenRegistry: TokenRegistryEntry[] = [
    { token: ETHToken, chain: EthereumMainnetChain, keyName: ChainKeyName.ethereum },
    { token: ETHPolygonToken, chain: EthereumPolygonChain, keyName: ChainKeyName.ethereumPolygon },
    { token: ETHSepoliaToken, chain: EthereumSepoliaChain, keyName: ChainKeyName.ethereumTestnetSepolia },
];

async function addLocalChain() {
    const chainId = (await (await EosioUtil.getApi()).v1.chain.get_info()).chain_id;

    // @ts-expect-error antelopeChainId is protected
    PangeaLocalChain.antelopeChainId = chainId.toString();
}

export let pangeaTokenEntry: TokenRegistryEntry & { chain: AntelopeChain };

if (settings.env === 'production') {
    pangeaTokenEntry = { token: LEOSToken, chain: PangeaMainnetChain, keyName: ChainKeyName.pangeaLeos };
} else if (settings.env === 'testnet') {
    pangeaTokenEntry = {
        token: LEOSTestnetToken,
        chain: PangeaTestnetChain,
        keyName: ChainKeyName.pangeaTestnetLeos,
    };
} else if (settings.env === 'staging' || settings.env === 'development') {
    pangeaTokenEntry = {
        token: LEOSStagingToken,
        chain: PangeaStagingChain,
        keyName: ChainKeyName.pangeaStagingLeos,
    };
} else {
    pangeaTokenEntry = {
        token: LEOSLocalToken,
        chain: PangeaLocalChain,
        keyName: ChainKeyName.pangeaLocalLeos,
    };
    addLocalChain();
}

ANTELOPE_CHAIN_ID_TO_CHAIN[pangeaTokenEntry.chain.getAntelopeChainId()] = pangeaTokenEntry.chain;

// Uncomment out these lines to test the chain easily:
// pangeaTokenEntry.token.isTransferable = () => true;
// pangeaTokenEntry.chain.isTestnet = () => false;

if (pangeaTokenEntry.chain.isTestnet()) {
    tokenRegistry.push(pangeaTokenEntry);
} else {
    tokenRegistry.unshift(pangeaTokenEntry);
}

export async function getChainEntryByName(chain: string | IChain): Promise<TokenRegistryEntry> {
    const chainName = typeof chain === 'string' ? chain : chain.getName();
    const chainEntry = tokenRegistry.find((c) => c.chain.getName() === chainName);

    if (!chainEntry) throw new Error(`Unsupported chain ${chainName} from getAssetFromChain()`);
    return chainEntry;
}

export async function getAssetFromChain(chainEntry: TokenRegistryEntry): Promise<AssetStorage> {
    const asset = await assetStorage.findAssetByName(chainEntry.token);

    if (!asset) throw new Error(`Asset not found for ${chainEntry.chain.getName()}`);
    return asset;
}

export async function getKeyFromChain(chainEntry: TokenRegistryEntry): Promise<IPrivateKey> {
    const key = await keyStorage.findByName(chainEntry.keyName, chainEntry.chain);

    if (!key) throw new Error(`Key not found for ${chainEntry.chain.getName()}`);
    return key;
}

export async function getAccountFromChain(chainEntry: TokenRegistryEntry, user: IUser): Promise<IAccount> {
    const { chain, token } = chainEntry;
    const asset = await getAssetFromChain(chainEntry);
    const key = await getKeyFromChain(chainEntry);

    let account: IAccount;

    if (chain.getChainType() === ChainType.ETHEREUM) {
        account = await EthereumAccount.fromPublicKey(
            chain as EthereumChain,
            await (key as EthereumPrivateKey).getPublicKey()
        );

        if (!asset) {
            await assetStorage.createAsset(new Asset(token, BigInt(0)), account);
        }
    } else {
        account = await AntelopeAccount.fromAccountAndPrivateKey(
            chain as AntelopeChain,
            await user.getAccountName(),
            key as AntelopePrivateKey
        );

        if (!asset) {
            await assetStorage.createAsset(new Asset(token, BigInt(0)), account);
        }
    }

    return account;
}

export const getAssetDetails = async (chainName: string | IChain): Promise<AccountDetails> => {
    const chainRegistryEntry = await getChainEntryByName(chainName);
    const asset = await getAssetFromChain(chainRegistryEntry);
    const key = await getKeyFromChain(chainRegistryEntry);

    return {
        network: chainRegistryEntry.chain.getName(),
        account: asset.accountName,
        balance: asset.balance,
        usdBalance: asset.usdBalance,
        icon: chainRegistryEntry.token.getLogoUrl(),
        symbol: chainRegistryEntry.token.getSymbol(),
        testnet: chainRegistryEntry.token.getChain().isTestnet(),
        isTransferable: chainRegistryEntry.token.isTransferable(),
        privateKey: key,
        chain: chainRegistryEntry.chain,
    };
};
