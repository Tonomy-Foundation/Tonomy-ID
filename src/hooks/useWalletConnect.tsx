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
        } catch (err: unknown) {
            console.log(err, typeof err);

            if (err instanceof Error && err.message === 'No private key found') {
                setWeb3wallet(null);
                setInitialized(false);
            } else {
                if (!initialized) setTimeout(onInitialize, 10000);
            }
        }
    }, [initialized]);

    useEffect(() => {
        if (!initialized) {
            onInitialize();
        }
    }, [initialized, onInitialize]);
    return { initialized, web3wallet };
}
