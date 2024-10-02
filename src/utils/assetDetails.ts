import { Images } from '../assets';
import useUserStore from '../store/userStore';
import {
    EthereumMainnetChain,
    EthereumPolygonChain,
    EthereumSepoliaChain,
    ETHPolygonToken,
    ETHSepoliaToken,
    ETHToken,
    USD_CONVERSION,
} from './chain/etherum';

import { assetStorage } from './StorageManager/setup';
import { VestingContract } from '@tonomy/tonomy-id-sdk';

const vestingContract = VestingContract.Instance;

interface AccountDetails {
    network: string;
    account: string | null;
    balance: string | null;
    usdBalance: number | null;
    icon: { uri: string } | string;
    symbol: string;
    testnet: boolean;
}

export const getAssetDetails = async (network: string): Promise<AccountDetails | null> => {
    let account: AccountDetails | null = null;

    const chains = [
        { token: ETHToken, chain: EthereumMainnetChain, network: 'Ethereum' },
        { token: ETHSepoliaToken, chain: EthereumSepoliaChain, network: 'Sepolia' },
        { token: ETHPolygonToken, chain: EthereumPolygonChain, network: 'Polygon' },
    ];

    if (network !== 'Pangea') {
        const chain = chains.find((c) => c.network === network);

        if (chain) {
            const asset = await assetStorage.findAssetByName(chain?.token);

            account = {
                network: chain.network,
                account: asset?.accountName || null,
                balance: asset?.balance || null,
                usdBalance: asset?.usdBalance || null,
                icon: { uri: chain.token.getLogoUrl() },
                symbol: chain.token.getSymbol(),
                testnet: chain.token.getChain().getChainId() === '11155111',
            };
        }
    } else {
        const userStore = useUserStore.getState();
        const user = userStore.user;
        const accountName = (await user.getAccountName()).toString();
        const accountPangeaBalance = await vestingContract.getBalance(accountName);

        account = {
            network: 'Pangea',
            account: accountName,
            balance: `${accountPangeaBalance} LEOS`,
            usdBalance: accountPangeaBalance * USD_CONVERSION,
            icon: Images.GetImage('logo48'),
            symbol: 'LEOS',
            testnet: false,
        };
    }

    return account;
};
