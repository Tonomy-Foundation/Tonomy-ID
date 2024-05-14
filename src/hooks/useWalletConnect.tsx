import { useCallback, useEffect, useState } from 'react';
import { createWeb3Wallet } from '../services/WalletConnect/Web3WalletClient';
import usePassphraseStore from '../store/passphraseStore';
import { generatePrivateKeyForEthereum } from '../utils/keys';

export default function useInitialization() {
    const [initialized, setInitialized] = useState(false);
    const { getPassphrase } = usePassphraseStore();

    const onInitialize = useCallback(async () => {
        try {
            const key = await generatePrivateKeyForEthereum(getPassphrase(), 'tonomy-id'); //TODO update this

            await createWeb3Wallet(key.web3PrivateKey);
            setInitialized(true);
        } catch (err: unknown) {
            console.log('Error for initializing', err);
        }
    }, []);

    useEffect(() => {
        if (!initialized) {
            onInitialize();
        }
    }, [initialized, onInitialize]);

    return initialized;
}
