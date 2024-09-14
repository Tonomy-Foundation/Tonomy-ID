import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import useErrorStore from '../../store/errorStore';
import useWalletStore from '../../store/useWalletStore';

const useWalletInitialization = (initialized: boolean) => {
    const errorStore = useErrorStore();
    const { initializeWalletState } = useWalletStore();

    useEffect(() => {
        const initializeWalletIfConnected = async () => {
            try {
                if (!initialized) {
                    await initializeWalletState();
                }
            } catch (e) {
                errorStore.setError({
                    error: new Error('Error initializing wallet. Check your internet connection.'),
                    expected: false,
                });
            }
        };

        const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isConnected) {
                initializeWalletIfConnected();
            }
        });

        return () => unsubscribe();
    }, [initialized, errorStore, initializeWalletState]);
};

export default useWalletInitialization;
