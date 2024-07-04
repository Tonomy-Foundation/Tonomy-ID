import { useCallback, useEffect, useState } from 'react';
import { createWeb3Wallet } from '../services/WalletConnect/WalletConnectModule';
import { connect } from '../utils/StorageManager/setup';
import { IWeb3Wallet } from '@walletconnect/web3wallet';

export default function useInitialization() {
    const [initialized, setInitialized] = useState(false);
    const [web3wallet, setWeb3wallet] = useState<IWeb3Wallet | null>(null);

    const onInitialize = useCallback(async () => {
        try {
            await connect();
            const wallet = await createWeb3Wallet();

            setWeb3wallet(wallet);
            setInitialized(true);
        } catch (err) {
            if (err instanceof Error && err.message !== 'No private key found') {
                setTimeout(onInitialize, 10000);
            } else {
                throw new Error(err);
            }
        }
    }, []);

    useEffect(() => {
        if (!initialized) {
            onInitialize();
        }
    }, [initialized, onInitialize]);

    return { initialized, web3wallet };
}
