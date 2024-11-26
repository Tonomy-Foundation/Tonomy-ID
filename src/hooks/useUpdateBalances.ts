import { useCallback, useEffect, useRef, useState } from 'react';
import { isNetworkError } from '../utils/errors';
import useWalletStore from '../store/useWalletStore';
import Debug from 'debug';
import { useFocusEffect } from '@react-navigation/native';

const debug = Debug('tonomy-id:hooks:useUpdateBalances');

const useUpdateBalances = () => {
    const { updateBalance } = useWalletStore();

    const isUpdatingBalances = useRef(false);
    const [refreshBalance, setIsRefreshing] = useState(false);
    const [isAssetLoading, setAssetLoading] = useState<boolean>(true);

    const updateAllBalances = useCallback(async () => {
        if (isUpdatingBalances.current) return; // Prevent re-entry if already running
        setAssetLoading(true);
        isUpdatingBalances.current = true;

        try {
            console.log('useAsset: updateAllBalances()');
            await updateBalance();
        } catch (error) {
            if (isNetworkError(error)) {
                debug('useAsset: Error updating account detail due to network error');
            } else {
                console.error('useAsset: updateAllBalances() error', error);
            }
        } finally {
            isUpdatingBalances.current = false;
            setAssetLoading(false);
        }
    }, [updateBalance]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);

        try {
            await updateAllBalances();
        } finally {
            setIsRefreshing(false);
        }
    }, [updateAllBalances]);

    useFocusEffect(
        useCallback(() => {
            updateAllBalances();

            const interval = setInterval(updateAllBalances, 10000);

            return () => clearInterval(interval);
        }, [])
    );

    return { updateAllBalances, onRefresh, refreshBalance, isAssetLoading };
};

export default useUpdateBalances;
