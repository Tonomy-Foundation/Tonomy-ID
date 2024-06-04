import { useCallback, useEffect, useState } from 'react';
import { createWeb3Wallet } from '../services/WalletConnect/WalletConnectModule';
import { connect } from '../utils/StorageManager/setup';
import { IWeb3Wallet } from '@walletconnect/web3wallet';

export default function useInitialization() {
    const [initialized, setInitialized] = useState(false);
    const [web3wallet, setWeb3wallet] = useState<IWeb3Wallet | null>(null);

    const onInitialize = useCallback(async () => {
        try {
            console.log('Initializing WalletConnect');
            await connect();
            const wallet = await createWeb3Wallet();

            setWeb3wallet(wallet);
            setInitialized(true);
        } catch (err: unknown) {
            console.log('Error initializing, Please try again in 10 seconds:', err);
            if (!initialized) setTimeout(onInitialize, 20000);
        }
    }, [initialized]);

    useEffect(() => {
        if (!initialized) {
            onInitialize();
        }
    }, [initialized, onInitialize]);

    return { initialized, web3wallet };
}
