import { useState, useCallback, useEffect, useMemo } from 'react';
import { capitalizeFirstLetter } from '../utils/strings';
import { assetStorage, connect } from '../utils/StorageManager/setup';
import useWalletStore from '../store/useWalletStore';
import { tokenRegistry } from '../utils/tokenRegistry';
import useUserStore from '../store/userStore';
import Debug from 'debug';

const debug = Debug('tonomy-id:hooks:useAssets');

const useCryptoAssets = () => {
    const { accountsInitialized, initializeWalletAccount } = useWalletStore();
    const { user } = useUserStore();

    const tokens = useMemo(() => tokenRegistry, []);

    const [accounts, setAccounts] = useState<
        { network: string; accountName: string; balance: string; usdBalance: number }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCryptoAssets = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Ensure accounts are initialized
            if (!accountsInitialized) await initializeWalletAccount(user);
            await connect();

            for (const { chain, token } of tokens) {
                try {
                    const asset = await assetStorage.findAssetByName(token);

                    debug(
                        `fetchCryptoAssets() fetching asset ${chain.getName()}: ${asset?.accountName}-${asset?.balance}`
                    );
                    let account;

                    if (asset) {
                        account = {
                            network: capitalizeFirstLetter(chain.getName()),
                            accountName: asset.accountName,
                            balance: asset.balance,
                            usdBalance: asset.usdBalance,
                        };
                    } else {
                        account = {
                            network: capitalizeFirstLetter(chain.getName()),
                            accountName: null,
                            balance: '0',
                            usdBalance: 0,
                        };
                    }

                    setAccounts((prevAccounts) => {
                        // find index of the account in the array
                        const index = prevAccounts.findIndex((acc) => acc.network === account.network);

                        if (index !== -1) {
                            // Update the existing asset
                            const updatedAccounts = [...prevAccounts];

                            updatedAccounts[index] = account;
                            return updatedAccounts;
                        } else {
                            // Add the new asset
                            return [...prevAccounts, account];
                        }
                    });
                } catch (assetError) {
                    console.error(`Error fetching asset for ${chain.getName()}:`, assetError);
                }
            }
        } catch (fetchError) {
            console.error('Error fetching crypto assets:', fetchError);
            setError(fetchError);
        } finally {
            setLoading(false);
        }
    }, [initializeWalletAccount, tokens, user, accountsInitialized]);

    useEffect(() => {
        fetchCryptoAssets();
    }, [fetchCryptoAssets]);

    return { accounts, fetchCryptoAssets, loading, error };
};

export default useCryptoAssets;
