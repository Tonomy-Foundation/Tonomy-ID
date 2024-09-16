import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import useWalletStore from '../store/useWalletStore';

const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const { disconnectSession } = useWalletStore();

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(async (state) => {
            setIsConnected(state.isConnected);

            if (!isConnected) {
                await disconnectSession();
            }
        });

        // Cleanup the listener on unmount
        return () => unsubscribe();
    }, []);

    return { isConnected };
};

export default useNetworkStatus;
