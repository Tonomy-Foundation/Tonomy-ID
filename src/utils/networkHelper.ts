import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import useWalletStore from '../store/useWalletStore';
import Debug from 'debug';

const debug = Debug('tonomy-id:utils:NetworkHelper');

const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const { core, web3wallet } = useWalletStore();

    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(async (state) => {
            debug('Network state changed', JSON.stringify(state, null, 2));

            if (!state.isConnected) {
                if (core) {
                    core.relayer.transportClose();
                    web3wallet?.core.events.removeAllListeners();
                    core.events.removeAllListeners();
                    core.events.removeAllListeners();
                    core.relayer.events.removeAllListeners();
                    core.relayer.provider.events.removeAllListeners();
                    core.relayer.subscriber.events.removeAllListeners();
                    core.relayer.provider.connection.events.removeAllListeners();
                }
            }

            setIsConnected(state.isConnected ? true : false);
        });

        // Cleanup the listener on unmount
        return () => unsubscribe();
    }, [core, web3wallet]);

    return { isConnected };
};

export default useNetworkStatus;
