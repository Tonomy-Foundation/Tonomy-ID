import { useState } from 'react';
import useFetchCrytpoAccount from './useFetchCrytpoAccount';
import useUpdateBalances from './useUpdateBalances';

const useAssetManager = () => {
    const [isAssetLoading, setAssetLoading] = useState(true);
    const [refreshBalance, setRefreshBalance] = useState(false);
    const [accounts, setAccounts] = useState<
        { network: string; accountName: string; balance: string; usdBalance: number }[]
    >([]);

    const { fetchCryptoAssets } = useFetchCrytpoAccount({
        setAccounts,
        setAssetLoading,
    });

    const { updateAllBalances, onRefresh } = useUpdateBalances({
        fetchCryptoAssets,
        setRefreshBalance,
    });

    return {
        isAssetLoading,
        refreshBalance,
        accounts,
        updateAllBalances,
        onRefresh,
    };
};

export default useAssetManager;
