import { Core } from '@walletconnect/core';
import { ICore } from '@walletconnect/types';
import { Web3Wallet, IWeb3Wallet } from '@walletconnect/web3wallet';
import settings from '../../settings';
import Web3 from 'web3';

const web3 = new Web3('http://localhost:8545');

export let web3wallet: IWeb3Wallet;
export let core: ICore;
export let currentETHAddress: string;

export async function createWeb3Wallet(web3key: string) {
    core = new Core({
        // @notice: If you want the debugger / logs
        // logger: 'debug',
        projectId: settings.config.walletConnectProjectId,
        relayUrl: 'wss://relay.walletconnect.com',
    });

    if (web3key) {
        const account = web3.eth.accounts.privateKeyToAccount(web3key);

        currentETHAddress = account.address;
    }

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
    return await core.pairing.pair({ uri: params.uri });
}
