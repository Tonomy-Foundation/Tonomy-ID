import { useCallback, useEffect, useState } from 'react';
import { createWeb3Wallet } from '../services/WalletConnect/Web3WalletClient';
import usePassphraseStore from '../store/passphraseStore';
import { generatePrivateKeyForEthereum } from '../utils/keys';
import useUserStore from '../store/userStore';

export default function useInitialization() {
    const [initialized, setInitialized] = useState(false);
    const { getPassphrase } = usePassphraseStore();
    const userStore = useUserStore();
    const user = userStore.user;

    console.log('getPassphrase', getPassphrase());
    const onInitialize = useCallback(async () => {
        try {
            const u = await user.getUsername();

            const username = u.getBaseUsername();

            console.log('username', username);
            if (username) {
                const key = await generatePrivateKeyForEthereum(getPassphrase(), username); //TODO update this

                await createWeb3Wallet(key.web3PrivateKey);
                setInitialized(true);
            } else setInitialized(false);
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
