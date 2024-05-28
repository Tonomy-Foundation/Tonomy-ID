import { useCallback, useEffect, useState } from 'react';
import { createWeb3Wallet } from '../services/WalletConnect/WalletConnectModule';
import { connect } from '../utils/StorageManager/setup';

export default function useInitialization() {
    const [initialized, setInitialized] = useState(false);

    const onInitialize = useCallback(async () => {
        try {
            await connect();
            await createWeb3Wallet();
            setInitialized(true);
        } catch (err: unknown) {
            console.log('Error initializing:', err);
            if (!initialized) setTimeout(onInitialize, 30000);
        }
    }, []);

    useEffect(() => {
        if (!initialized) {
            onInitialize();
        }
    }, [initialized, onInitialize]);

    return initialized;
}
