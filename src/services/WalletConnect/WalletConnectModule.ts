// WalletConnectModule.js
import { Core } from '@walletconnect/core';
import { formatJsonRpcError } from '@json-rpc-tools/utils';
import { getSdkError } from '@walletconnect/utils';
import { Web3Wallet } from '@walletconnect/web3wallet';
import settings from '../../settings';
import { keyStorage } from '../../utils/StorageManager/setup';
import {
    EthereumAccount,
    EthereumMainnetChain,
    EthereumPrivateKey,
    EthereumSepoliaChain,
    ETHSepoliaToken,
} from '../../utils/chain/etherum';
import useWalletStore from '../../store/useWalletStore';

export async function createWeb3Wallet() {
    const setWeb3wallet = useWalletStore.getState().setWeb3wallet;
    const setCore = useWalletStore.getState().setCore;
    const setCurrentETHAddress = useWalletStore.getState().setCurrentETHAddress;
    const setPrivateKey = useWalletStore.getState().setPrivateKey;

    const core = new Core({
        projectId: settings.config.walletConnectProjectId,
        relayUrl: 'wss://relay.walletconnect.com',
    });

    setCore(core);

    const privateKey = await keyStorage.findByName('ethereum');

    let ethereumAccount;

    if (privateKey) {
        const exportedPrivateKey = '0xc7709ab54044f7a97d8b3d006c404644a15286c7cc13e7a597353a405610e690'; //await privateKey.exportPrivateKey();
        const ethereumPrivateKey = new EthereumPrivateKey(exportedPrivateKey);

        setPrivateKey(exportedPrivateKey);

        if (settings.env === 'production') {
            ethereumAccount = await EthereumAccount.fromPublicKey(
                EthereumMainnetChain,
                await ethereumPrivateKey.getPublicKey()
            );
        } else {
            ethereumAccount = await EthereumAccount.fromPublicKey(
                EthereumSepoliaChain,
                await ethereumPrivateKey.getPublicKey()
            );
        }

        const currentETHAddress = ethereumAccount.getName();

        console.log(
            'currentETHAddress1',
            currentETHAddress,
            (await ethereumAccount.getBalance(ETHSepoliaToken)).amount.toString() //730920113875596000
        );
        // Call the getBalance function from the token instance
        // const balance = await ETHSepoliaToken.getUsdValue(ethereumAccount);

        // console.log('Balance:', balance.toString());

        setCurrentETHAddress(currentETHAddress);
    }

    const web3wallet = await Web3Wallet.init({
        core,
        metadata: {
            name: settings.config.appName,
            description: settings.config.ecosystemName,
            url: 'https://walletconnect.com/',
            icons: [settings.config.images.logo48],
        },
    });

    setWeb3wallet(web3wallet);
    return web3wallet;
}

export async function _pair(uri: string) {
    const core = useWalletStore.getState().core;

    if (core) {
        return await core.pairing.pair({ uri });
    }

    throw new Error('Core not initialized');
}

export function rejectRequest(request) {
    const { id } = request;

    return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message);
}

export async function disconnect() {
    const setWeb3wallet = useWalletStore.getState().setWeb3wallet;
    const setCurrentETHAddress = useWalletStore.getState().setCurrentETHAddress;

    setWeb3wallet(null);
    setCurrentETHAddress(null);
}
