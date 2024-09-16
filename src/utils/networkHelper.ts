import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
        });

        // Cleanup the listener on unmount
        return () => unsubscribe();
    }, []);

    return { isConnected };
};

export default useNetworkStatus;
