import { Core } from '@walletconnect/core';
import { ICore } from '@walletconnect/types';
import { Web3Wallet, IWeb3Wallet } from '@walletconnect/web3wallet';
import settings from '../../settings';

export let web3wallet: IWeb3Wallet;
export let core: ICore;
export let currentETHAddress: string;

import { createOrRestoreEIP155Wallet } from './EIP155Wallet';

export async function createWeb3Wallet() {
    core = new Core({
        // @notice: If you want the debugger / logs
        // logger: 'debug',
        projectId: settings.config.walletConnectProjectId,
        relayUrl: 'wss://relay.walletconnect.com',
    });

    const { eip155Addresses } = await createOrRestoreEIP155Wallet();

    currentETHAddress = eip155Addresses[0];

    web3wallet = await Web3Wallet.init({
        core,
        metadata: {
            name: settings.config.appName,
            description: settings.config.ecosystemName,
            url: 'https://walletconnect.com/',
            icons: [settings.config.images.logo48],
        },
    });
}

export async function _pair(params: { uri: string }) {
    console.log('param uri', await core.pairing.pair({ uri: params.uri }));
    return await core.pairing.pair({ uri: params.uri });
}
