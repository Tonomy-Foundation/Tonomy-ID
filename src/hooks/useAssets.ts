import { useState, useCallback, useEffect, useMemo } from 'react';
import { capitalizeFirstLetter } from '../utils/strings';
import { assetStorage, connect } from '../utils/StorageManager/setup';
import useWalletStore from '../store/useWalletStore';
import { tokenRegistry } from '../utils/tokenRegistry';
import useUserStore from '../store/userStore';
import Debug from 'debug';
import { useFocusEffect } from '@react-navigation/native';

const debug = Debug('tonomy-id:hooks:useAssets');

const useCryptoAssets = ({ setAccounts, setAssetLoading }) => {
    const { accountsInitialized, initializeWalletAccount } = useWalletStore();
    const { user } = useUserStore();

    const tokens = useMemo(() => tokenRegistry, []);

    const fetchCryptoAssets = useCallback(async () => {
        console.log('useCryptoAssets: fetchCryptoAssets()');

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
        }
    }, [initializeWalletAccount, tokens, user, accountsInitialized, setAccounts]);

    useFocusEffect(
        useCallback(() => {
            fetchCryptoAssets().then(() => setAssetLoading(false));
        }, [fetchCryptoAssets, setAssetLoading])
    );

    return { fetchCryptoAssets };
};

export default useCryptoAssets;
