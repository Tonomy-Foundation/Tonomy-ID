import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import useWalletStore from '../store/useWalletStore';

const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const { core } = useWalletStore();

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener((state) => {
            if (!state.isConnected) {
                if (core) {
                    console.log('iff');
                    core.relayer.transportClose();
                    core.events.removeAllListeners();
                    core.events.removeAllListeners();
                    core.relayer.events.removeAllListeners();
                    core.relayer.provider.events.removeAllListeners();
                    core.relayer.subscriber.events.removeAllListeners();
                    core.relayer.provider.connection.events.removeAllListeners();
                }
            }

            setIsConnected(state.isConnected);
        });

        // Cleanup the listener on unmount
        return () => unsubscribe();
    }, []);

    return { isConnected };
};

export default useNetworkStatus;
