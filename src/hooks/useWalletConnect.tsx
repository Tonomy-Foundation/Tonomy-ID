import { useCallback, useEffect } from 'react';
import { createWeb3Wallet } from '../services/WalletConnect/WalletConnectModule';
import { connect } from '../utils/StorageManager/setup';
import useWalletStore from '../store/useWalletStore';

export default function useInitialization() {
    const { initialized, setInitialized, web3wallet, setWeb3wallet } = useWalletStore();

    const onInitialize = useCallback(async () => {
        try {
            await connect();
            const wallet = await createWeb3Wallet();

            setWeb3wallet(wallet);
            setInitialized(true);
        } catch (err) {
            if (err instanceof Error && err.message === 'No private key found') {
                console.log('error', err);
            }
        }
    }, [setInitialized, setWeb3wallet]);

    useEffect(() => {
        if (!initialized) {
            onInitialize();
        }
    }, [initialized, onInitialize]);

    return { initialized, web3wallet };
}
