import { supportedChains } from '../assetDetails';
import { EthereumAccount } from '../chain/etherum';

export const getChainIds = (namespaces: any) =>
    namespaces.eip155?.chains?.map((chain: string) => chain.split(':')[1]) || [];

export const hasUnsupportedChains = (chainIds: string[]) =>
    chainIds.some((chainId) => !['1', '11155111', '137'].includes(chainId));
