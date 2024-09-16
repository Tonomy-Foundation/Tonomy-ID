import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import useWalletStore from '../store/useWalletStore';
import { ICore } from '@walletconnect';

const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const { disconnectSession, core } = useWalletStore();

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener((state) => {
            if (!state.isConnected) {
                core?.relayer.transportClose();
            }

            setIsConnected(state.isConnected);
        });

        // Cleanup the listener on unmount
        return () => unsubscribe();
    }, []);

    return { isConnected };
};

export default useNetworkStatus;
