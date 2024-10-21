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
    account: string | null;
    balance: string | null;
    usdBalance: number | null;
    icon: { uri: string } | string;
    symbol: string;
    testnet: boolean;
    privateKey?: IPrivateKey;
    chain?: IChain;
}

export type ChainRegistryEntity = {
    token: IToken;
    chain: IChain;
    keyName: string;
};

export const chainRegistry: ChainRegistryEntity[] = [
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

export const getAssetDetails = async (chainName: string): Promise<AccountDetails | null> => {
    const selectedChain = chainRegistry.find((c) => c.chain.getName() === chainName);

    if (!selectedChain) {
        throw new Error(`Unsupported chain ${chainName} from getAssetDetails()`);
    }

    const asset = await assetStorage.findAssetByName(selectedChain?.token);
    const key = await keyStorage.findByName(selectedChain.keyName, selectedChain.chain);

    return {
        network: selectedChain.chain.getName(),
        account: asset?.accountName || null,
        balance: asset?.balance || null,
        usdBalance: asset?.usdBalance || null,
        icon: { uri: selectedChain.token.getLogoUrl() },
        symbol: selectedChain.token.getSymbol(),
        testnet: selectedChain.token.getChain().isTestnet(),
        ...(key && { privateKey: key }), // why is this returned?
        chain: selectedChain.chain,
    };
};
