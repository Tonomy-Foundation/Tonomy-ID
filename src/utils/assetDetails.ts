import {
    EthereumMainnetChain,
    EthereumPolygonChain,
    EthereumSepoliaChain,
    ETHPolygonToken,
    ETHSepoliaToken,
    ETHToken,
} from './chain/etherum';
import {
    LEOSLocalToken,
    LEOSStagingToken,
    LEOSTestnetToken,
    LEOSToken,
    PangeaLocalChain,
    PangeaMainnetChain,
    PangeaStagingChain,
    PangeaTestnetChain,
} from '../utils/chain/antelope';
import { IChain, IPrivateKey, IToken } from './chain/types';
import { assetStorage, keyStorage } from './StorageManager/setup';
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

export type ChainRegistryEntry = {
    token: IToken;
    chain: IChain;
    keyName: string;
};

export const chainRegistry: ChainRegistryEntry[] = [
    { token: ETHToken, chain: EthereumMainnetChain, keyName: 'ethereum' },
    { token: ETHPolygonToken, chain: EthereumPolygonChain, keyName: 'ethereumPolygon' },
    { token: ETHSepoliaToken, chain: EthereumSepoliaChain, keyName: 'ethereumTestnetSepolia' },
];

switch (settings.env) {
    case 'production':
        chainRegistry.unshift({ token: LEOSToken, chain: PangeaMainnetChain, keyName: 'pangeaLeos' });
        break;
    case 'testnet':
        chainRegistry.unshift({ token: LEOSTestnetToken, chain: PangeaTestnetChain, keyName: 'pangeaTestnetLeos' });
        break;
    case 'staging':
        chainRegistry.push({ token: LEOSStagingToken, chain: PangeaStagingChain, keyName: 'pangeaStagingLeos' });
        break;
    default:
        chainRegistry.push({ token: LEOSLocalToken, chain: PangeaLocalChain, keyName: 'pangeaLocalLeos' });
        break;
}

export const getAssetDetails = async (chainName: string): Promise<AccountDetails> => {
    const chainRegistryEntry = chainRegistry.find((c) => c.chain.getName() === chainName);

    if (!chainRegistryEntry) throw new Error(`Unsupported chain ${chainName} from getAssetDetails()`);

    const asset = await assetStorage.findAssetByName(chainRegistryEntry.token);
    const key = await keyStorage.findByName(chainRegistryEntry.keyName, chainRegistryEntry.chain);

    if (!asset) throw new Error(`Asset not found for ${chainRegistryEntry.chain.getName()}`);
    if (!key) throw new Error(`Key not found for ${chainRegistryEntry.chain.getName()}`);

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
