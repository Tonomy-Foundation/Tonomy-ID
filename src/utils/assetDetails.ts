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
import { IChain, IPrivateKey } from './chain/types';

import { assetStorage, keyStorage } from './StorageManager/setup';
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
    privateKey?: IPrivateKey;
    chain?: IChain;
}

export const supportedChains = [
    { token: ETHToken, chain: EthereumMainnetChain, keyName: 'ethereum' },
    { token: ETHSepoliaToken, chain: EthereumSepoliaChain, keyName: 'ethereumTestnetSepolia' },
    { token: ETHPolygonToken, chain: EthereumPolygonChain, keyName: 'ethereumPolygon' },
];

export const getAssetDetails = async (network: string): Promise<AccountDetails | null> => {
    let account: AccountDetails | null = null;

    if (network === 'Pangea') {
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
    } else {
        const selectedChain = supportedChains.find((c) => c.chain.getName() === network);

        if (selectedChain) {
            const asset = await assetStorage.findAssetByName(selectedChain?.token);
            const key = await keyStorage.findByName(selectedChain.keyName, selectedChain.chain);

            account = {
                network: selectedChain.chain.getName(),
                account: asset?.accountName || null,
                balance: asset?.balance || null,
                usdBalance: asset?.usdBalance || null,
                icon: { uri: selectedChain.token.getLogoUrl() },
                symbol: selectedChain.token.getSymbol(),
                testnet: selectedChain.token.getChain().getChainId() === '11155111',
                ...(key && { privateKey: key }),
                chain: selectedChain.chain,
            };
        }
    }

    return account;
};
