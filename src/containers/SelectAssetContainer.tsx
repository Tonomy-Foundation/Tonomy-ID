import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SelectAssetScreenNavigationProp } from '../screens/SelectAsset';
import theme from '../utils/theme';
import {
    EthereumMainnetChain,
    EthereumPolygonChain,
    EthereumSepoliaChain,
    ETHPolygonToken,
    ETHSepoliaToken,
    ETHToken,
    USD_CONVERSION,
} from '../utils/chain/etherum';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AssetItem from '../components/AssetItem';
import { useFocusEffect } from '@react-navigation/native';
import { appStorage, assetStorage, connect } from '../utils/StorageManager/setup';
import { capitalizeFirstLetter } from '../utils/strings';
import { VestingContract } from '@tonomy/tonomy-id-sdk';

import Debug from 'debug';
import useUserStore from '../store/userStore';
import { formatCurrencyValue } from '../utils/numbers';

const debug = Debug('tonomy-id:containers:MainContainer');
const vestingContract = VestingContract.Instance;

const SelectAssetContainer = ({
    navigation,
    type,
}: {
    navigation: SelectAssetScreenNavigationProp['navigation'];
    type: string;
}) => {
    const userStore = useUserStore();
    const user = userStore.user;
    const [accountName, setAccountName] = useState('');
    const [pangeaBalance, setPangeaBalance] = useState(0.0);

    const [accounts, setAccounts] = useState<
        { network: string; accountName: string | null; balance: string; usdBalance: number }[]
    >([]);

    const [developerMode, setDeveloperMode] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchSettings = async () => {
                const developerMode = await appStorage.getDeveloperMode();

                setDeveloperMode(developerMode);
            };

            fetchSettings();
        }, [])
    );

    const chains = useMemo(
        () => [
            { token: ETHToken, chain: EthereumMainnetChain },
            { token: ETHSepoliaToken, chain: EthereumSepoliaChain },
            { token: ETHPolygonToken, chain: EthereumPolygonChain },
        ],
        []
    );

    const fetchCryptoAssets = useCallback(async () => {
        try {
            const accountName = (await user.getAccountName()).toString();

            setAccountName(accountName);
            const accountPangeaBalance = await vestingContract.getBalance(accountName);

            setPangeaBalance(accountPangeaBalance);

            await connect();

            for (const chainObj of chains) {
                const asset = await assetStorage.findAssetByName(chainObj.token);

                debug(`fetchCryptoAssets() fetching asset for ${chainObj.chain.getName()}`);
                let account;

                console.log('asset', asset);

                if (asset) {
                    account = {
                        network: capitalizeFirstLetter(chainObj.chain.getName()),
                        accountName: asset.accountName,
                        balance: asset.balance,
                        usdBalance: asset.usdBalance,
                    };
                } else {
                    account = {
                        network: capitalizeFirstLetter(chainObj.chain.getName()),
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
            }
        } catch (error) {
            debug('fetchCryptoAssets() error', error);
        }
    }, [chains, user]);

    console.log('accounts', pangeaBalance, accountName);

    useEffect(() => {
        fetchCryptoAssets();
    }, [fetchCryptoAssets]);

    const findAccountByChain = (chain: string) => {
        const accountExists = accounts.find((account) => account.network === chain);
        const balance = accountExists?.balance;
        const usdBalance = accountExists?.usdBalance;
        const account = accountExists?.accountName;

        return { account, balance, usdBalance };
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <Text style={styles.screenTitle}>select a currency to {type}</Text>
                    <View style={{ marginTop: 20, flexDirection: 'column', gap: 20 }}>
                        <AssetItem
                            type={type}
                            navigation={navigation}
                            networkName="Pangea"
                            currency="LEOS"
                            leos
                            accountBalance={{
                                balance: formatCurrencyValue(pangeaBalance),
                                usdBalance: Number(pangeaBalance) * USD_CONVERSION,
                            }}
                            accountName={accountName}
                        />
                        {chains.map((chainObj, index) => {
                            const accountData = findAccountByChain(capitalizeFirstLetter(chainObj.chain.getName()));

                            if (chainObj.chain.getChainId() === '11155111' && !developerMode) {
                                return null;
                            }

                            return (
                                <AssetItem
                                    key={index}
                                    type={type}
                                    navigation={navigation}
                                    accountBalance={{
                                        balance: accountData.balance || '',
                                        usdBalance: accountData.usdBalance || 0,
                                    }}
                                    testnet={chainObj.chain.getChainId() === '11155111'}
                                    account={accountData.account || ''}
                                    icon={{ uri: chainObj.token.getLogoUrl() }}
                                    networkName={capitalizeFirstLetter(chainObj.chain.getName())}
                                    currency={chainObj.token.getSymbol()}
                                />
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    content: {
        flex: 1,
        marginTop: 10,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    screenTitle: {
        textTransform: 'uppercase',
        color: theme.colors.tabGray,
        fontSize: 12,
        letterSpacing: 0.16,
        fontWeight: '500',
    },
    assetsView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    favicon: {
        width: 20,
        height: 20,
        marginRight: 4,
    },
    assetsNetwork: {
        backgroundColor: theme.colors.grey7,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    secondaryColor: {
        fontSize: 13,
        color: theme.colors.secondary2,
    },
});

export default SelectAssetContainer;
