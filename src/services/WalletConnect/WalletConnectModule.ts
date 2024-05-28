import '@walletconnect/react-native-compat';
import { Core } from '@walletconnect/core';
import { Web3Wallet } from '@walletconnect/web3wallet';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { ethers, InfuraProvider } from 'ethers';
import { keyStorage } from '../../utils/StorageManager/setup';
import { EthereumPrivateKey, EthereumAccount, EthereumSepoliaChain } from '../../utils/chain/etherum';

const projectId = '2850896ad9cf6c1d958203b00b199c2d';

const initWalletConnect = async (uri) => {
    console.log('initWalletConnect', uri);
    const core = new Core({
        // @notice: If you want the debugger / logs
        // logger: 'debug',
        projectId: projectId,
        relayUrl: 'wss://relay.walletconnect.com',
    });
    const privateKey = await keyStorage.findByName('ethereum');

    console.log('privateKey', privateKey?.wallet?.address, privateKey?.privateKeyHex);
    let ethereumAccount;

    if (privateKey) {
        const ethereumPrivateKey = new EthereumPrivateKey(privateKey?.privateKeyHex); // Cast privateKey to EthereumPrivateKey

        console.log('ethereumPrivateKey', await ethereumPrivateKey.getPublicKey());

        ethereumAccount = await EthereumAccount.fromPublicKey(
            EthereumSepoliaChain,
            await ethereumPrivateKey.getPublicKey()
        );
    }

    console.log('ethereumAccount', ethereumAccount);

    const web3wallet = await Web3Wallet.init({
        core,
        metadata: {
            name: 'Demo app',
            description: 'Demo Client as Wallet/Peer',
            url: 'www.walletconnect.com',
            icons: [],
        },
    });

    await web3wallet.pair({ uri });

    web3wallet.on('session_proposal', async (proposal) => {
        console.log('proposal', proposal, EthereumSepoliaChain.getChainId());

        try {
            const approvedNamespaces = buildApprovedNamespaces({
                proposal: proposal.params,
                supportedNamespaces: {
                    eip155: {
                        chains: [`eip155:${EthereumSepoliaChain.getChainId()}`],
                        methods: ['eth_sendTransaction', 'personal_sign'],
                        events: ['accountsChanged', 'chainChanged'],
                        accounts: [`eip155:${EthereumSepoliaChain.getChainId()}:${ethereumAccount}`],
                    },
                },
            });

            console.log('namespace', ethereumAccount, {
                chains: [`eip155:${EthereumSepoliaChain.getChainId()}`],
                methods: ['eth_sendTransaction', 'personal_sign'],
                events: ['accountsChanged', 'chainChanged'],
                accounts: [`eip155:${EthereumSepoliaChain.getChainId()}:${ethereumAccount}`],
            });
            const session = await web3wallet.approveSession({
                id: proposal.id,
                namespaces: approvedNamespaces,
            });

            console.log('session', session);
        } catch (error) {
            console.log('error', error);
            await web3wallet.rejectSession({
                id: proposal.id,
                reason: getSdkError('USER_REJECTED'),
            });
        }
    });

    // web3wallet.on('session_request', async (event) => {
    //     const { topic, params, id } = event;
    //     const { request } = params;
    //     const { data, from, to, value } = request.params[0];

    //     const transaction = { from, to, data, value };

    //     console.log('transaction', transaction);

    //     try {
    //         const provider = new InfuraProvider(infuraNetwork);
    //         const wallet = new ethers.Wallet(privateKey, provider);
    //         const signedTransaction = await wallet.sendTransaction(transaction);

    //         await signedTransaction.wait();
    //         const response = { id, result: signedTransaction, jsonrpc: '2.0' };

    //         await web3wallet.respondSessionRequest({ topic, response });
    //     } catch (error) {
    //         console.error('Error sending transaction:', error);
    //     }
    // });

    await web3wallet.core.pairing.pair({ uri, activatePairing: true });
};

export { initWalletConnect };
