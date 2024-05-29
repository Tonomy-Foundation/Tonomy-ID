import { Core } from '@walletconnect/core';
import { ICore, SignClientTypes } from '@walletconnect/types';
import { formatJsonRpcError } from '@json-rpc-tools/utils';
import { getSdkError } from '@walletconnect/utils';
import { Web3Wallet, IWeb3Wallet } from '@walletconnect/web3wallet';
import settings from '../../settings';
import { keyStorage } from '../../utils/StorageManager/setup';
import {
    EthereumAccount,
    EthereumMainnetChain,
    EthereumPrivateKey,
    EthereumSepoliaChain,
} from '../../utils/chain/etherum';

export let web3wallet: IWeb3Wallet | null = null;
export let core: ICore;
export let currentETHAddress: string | null = null;

export async function createWeb3Wallet() {
    core = new Core({
        projectId: settings.config.walletConnectProjectId,
        relayUrl: 'wss://relay.walletconnect.com',
    });

    const privateKey = await keyStorage.findByName('ethereum');

    console.log(await privateKey?.exportPrivateKey(), 'keyyyy');
    let ethereumAccount;

    if (privateKey) {
        const ethereumPrivateKey = new EthereumPrivateKey(await privateKey?.exportPrivateKey()); // Cast privateKey to EthereumPrivateKey

        if (settings.env === 'production ') {
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

        currentETHAddress = ethereumAccount.getName();
        web3wallet = await Web3Wallet.init({
            core,
            metadata: {
                name: settings.config.appName,
                description: settings.config.ecosystemName,
                url: 'https://walletconnect.com/',
                icons: [settings.config.images.logo48],
            },
        });
    } else {
        throw new Error('No private key found');
    }
}

export async function _pair(uri: string) {
    return await core.pairing.pair({ uri });
}

export function rejectRequest(request: SignClientTypes.EventArguments['session_request']) {
    const { id } = request;

    return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message);
}

export async function disconnect() {
    if (web3wallet) {
        web3wallet = null;
    }

    currentETHAddress = null;
}
