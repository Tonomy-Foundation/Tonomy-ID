import { useCallback, useRef, useState } from 'react';
import { isNetworkError } from '../utils/errors';
import useWalletStore from '../store/useWalletStore';
import Debug from 'debug';
import { useFocusEffect } from '@react-navigation/native';

const debug = Debug('tonomy-id:hooks:useUpdateBalances');

const useUpdateBalances = ({ fetchCryptoAssets, setRefreshBalance }) => {
    const { updateBalance } = useWalletStore();

    const isUpdatingBalances = useRef(false);

    const updateAllBalances = useCallback(async () => {
        if (isUpdatingBalances.current) return; // Prevent re-entry if already running
        isUpdatingBalances.current = true;

        try {
            await updateBalance();
            await fetchCryptoAssets();
        } catch (error) {
            if (isNetworkError(error)) {
                debug('useAsset: Error updating account detail due to network error');
            } else {
                console.error('useAsset: updateAllBalances() error', error);
            }
        } finally {
            isUpdatingBalances.current = false;
        }
    }, [updateBalance, fetchCryptoAssets]);

    const onRefresh = useCallback(async () => {
        setRefreshBalance(true);

        try {
            await updateAllBalances();
        } finally {
            setRefreshBalance(false);
        }
    }, [updateAllBalances, setRefreshBalance]);

    useFocusEffect(
        useCallback(() => {
            updateAllBalances();

            const interval = setInterval(updateAllBalances, 8000);

            return () => clearInterval(interval);
        }, [updateAllBalances])
    );

    return { updateAllBalances, onRefresh };
};

export default useUpdateBalances;
