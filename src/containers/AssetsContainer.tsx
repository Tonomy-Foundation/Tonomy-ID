import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { TButtonOutlined } from '../components/atoms/TButton';
import { TP } from '../components/atoms/THeadings';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import theme, { commonStyles } from '../utils/theme';
import { AssetsScreenNavigationProp } from '../screens/AssetListingScreen';
import useWalletStore from '../store/useWalletStore';
import Debug from 'debug';
import { formatCurrencyValue } from '../utils/numbers';
import { capitalizeFirstLetter } from '../utils/strings';
import { isNetworkError } from '../utils/errors';
import { assetStorage, connect } from '../utils/StorageManager/setup';
import { ArrowDown, ArrowUp } from 'iconoir-react-native';
import { tokenRegistry } from '../utils/tokenRegistry';
import TSpinner from '../components/atoms/TSpinner';
import useAppSettings from '../hooks/useAppSettings';
import useUserStore from '../store/userStore';

const debug = Debug('tonomy-id:containers:AssetsContainer');

export default function AssetsContainer({ navigation }: { navigation: AssetsScreenNavigationProp['navigation'] }) {
    const [total, setTotal] = useState<number>(0);
    const [isAssetLoading, setAssetLoading] = useState<boolean>(true);
    const [refreshBalance, setRefreshBalance] = useState(false);
    const { developerMode } = useAppSettings();

    const { accountsInitialized, initializeWalletAccount } = useWalletStore();

    const isUpdatingBalances = useRef(false);
    const [accounts, setAccounts] = useState<
        { network: string; accountName: string; balance: string; usdBalance: number }[]
    >([]);
    const { updateBalance } = useWalletStore();
    const { user } = useUserStore();

    const tokens = useMemo(() => tokenRegistry, []);

    const fetchCryptoAssets = useCallback(async () => {
        try {
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
                } catch (error) {
                    debug(`fetchCryptoAssets() error fetching ${chain.getName()} asset`, error);
                }
            }
        } catch (error) {
            console.error('fetchCryptoAssets() error', error);
        }
    }, [accountsInitialized, initializeWalletAccount, tokens, user]);

    const updateAllBalances = useCallback(async () => {
        if (isUpdatingBalances.current) return; // Prevent re-entry if already running
        isUpdatingBalances.current = true;

        try {
            debug('updateAllBalances()');
            await updateBalance();
            await fetchCryptoAssets();
            setAssetLoading(false);
        } catch (error) {
            if (isNetworkError(error)) {
                debug('updateAllBalances() Error updating account detail network error:');
            } else {
                console.error('AssetsContainer() updateAllBalances() error', error);
            }
        } finally {
            isUpdatingBalances.current = false;
        }
    }, [updateBalance, fetchCryptoAssets]);

    const onRefresh = useCallback(async () => {
        try {
            setRefreshBalance(true);
            await updateAllBalances();
        } finally {
            setRefreshBalance(false);
        }
    }, [updateAllBalances]);

    // updateAllBalances() on mount and every 20 seconds
    useEffect(() => {
        updateAllBalances();

        const interval = setInterval(updateAllBalances, 10000);

        return () => clearInterval(interval);
    }, [updateAllBalances]);

    useEffect(() => {
        const totalAssetsUSDBalance = accounts.reduce((previousValue, currentValue) => {
            return previousValue + currentValue.usdBalance;
        }, 0);

        setTotal(totalAssetsUSDBalance);
    }, [accounts]);

    const findAccountByChain = (chain: string) => {
        const accountExists = accounts.find((account) => account.network === chain);

        return {
            account: accountExists?.accountName,
            balance: accountExists?.balance,
            usdBalance: accountExists?.usdBalance,
        };
    };

    return (
        <View style={styles.content}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={<RefreshControl refreshing={refreshBalance} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <Text style={styles.headerAssetsAmount}>{`$${total.toFixed(2)}`}</Text>
                    <View style={styles.sendReceiveButtons}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SelectAsset', { type: 'send', screenTitle: 'Send' })}
                            style={styles.flexCenter}
                        >
                            <View style={styles.headerButton}>
                                <ArrowUp height={20} width={20} color={theme.colors.black} strokeWidth={2} />
                            </View>
                            <Text style={styles.textSize}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('SelectAsset', {
                                    type: 'receive',
                                    screenTitle: 'Recieve',
                                })
                            }
                            style={styles.flexCenter}
                        >
                            <View style={styles.headerButton}>
                                <ArrowDown height={20} width={20} color={theme.colors.black} strokeWidth={2} />
                            </View>
                            <Text style={styles.textSize}>Receive</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {!isAssetLoading ? (
                    <View style={styles.scrollContent}>
                        {tokens.map((chainObj, index) => {
                            const chainName = capitalizeFirstLetter(chainObj.chain.getName());

                            const accountData = findAccountByChain(chainName);

                            if (chainObj.chain.isTestnet() && !developerMode) {
                                return null;
                            }

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        navigation.navigate('AssetDetail', {
                                            screenTitle: chainName,
                                            network: chainObj.chain.getName(),
                                        });
                                    }}
                                    style={styles.assetsView}
                                >
                                    <Image
                                        source={{ uri: chainObj.token.getLogoUrl() }}
                                        style={[styles.favicon, { resizeMode: 'contain' }]}
                                    />
                                    <View style={styles.assetContent}>
                                        <View style={styles.flexRowCenter}>
                                            <Text style={{ fontSize: 15 }}>{chainObj.token.getSymbol()}</Text>
                                            <View style={styles.assetsNetwork}>
                                                <Text
                                                    style={{
                                                        fontSize: 11,
                                                    }}
                                                >
                                                    {chainName}
                                                </Text>
                                            </View>
                                            {chainObj.chain.isTestnet() && (
                                                <View style={styles.assetsTestnetNetwork}>
                                                    <Text style={styles.assetTestnetText}>Testnet</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.flexColEnd}>
                                            {accountData.account ? (
                                                <View style={styles.flexColEnd}>
                                                    <View style={styles.flexRowCenter}>
                                                        <Text style={{ fontSize: 15 }}>{accountData.balance}</Text>
                                                    </View>
                                                    <Text style={styles.secondaryColor}>
                                                        ${formatCurrencyValue(accountData.usdBalance ?? 0)}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            navigation.navigate('CreateEthereumKey');
                                                        }}
                                                    >
                                                        <Text style={{ fontSize: 13 }}>Not connected</Text>
                                                        <Text style={styles.generateKey}>Generate key</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <TSpinner />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    requestView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    requestText: {
        paddingHorizontal: 30,
        marginHorizontal: 10,
        paddingVertical: 30,
        marginTop: 10,
        textAlign: 'center',
    },
    image: {
        width: 200,
        height: 190,
        resizeMode: 'contain',
        marginTop: 20,
        marginBottom: 20,
    },
    container: {
        padding: 16,
        flex: 1,
    },
    content: {
        flex: 1,
        paddingVertical: 65,
        paddingHorizontal: 15,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    headerAssetsAmount: {
        fontSize: 40,
        fontWeight: '400',
        ...commonStyles.secondaryFontFamily,
    },
    headerButton: {
        backgroundColor: theme.colors.grey7,
        width: 37,
        height: 37,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    button: {
        width: '50%',
    },
    accountHead: {
        fontSize: 16,
        marginBottom: 4,
        fontWeight: '600',
    },
    cards: {
        flex: 1,
    },
    scrollView: {
        marginRight: -20,
    },
    appDialog: {
        backgroundColor: theme.colors.lightBg,
        borderStyle: 'solid',
        borderRadius: 7,
        padding: 10,
        width: '100%',
        marginTop: 5,
    },
    networkTitle: {
        color: theme.colors.secondary2,
        fontSize: 12,
    },
    secondaryColor: {
        fontSize: 13,
        color: theme.colors.secondary2,
    },
    favicon: {
        width: 26,
        height: 26,
        marginRight: 4,
    },
    accountsView: {
        marginTop: 25,
        paddingHorizontal: 5,
    },
    balanceView: {
        marginTop: 7,
    },
    marginTop: {
        marginTop: 28,
    },
    assetsView: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        padding: 10,
    },
    assetsNetwork: {
        backgroundColor: theme.colors.grey7,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    assetsTestnetNetwork: {
        backgroundColor: theme.colors.blue,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    assetTestnetText: {
        fontSize: 9,
        color: theme.colors.white,
    },
    sendReceiveButtons: {
        flexDirection: 'row',
        gap: 40,
        marginTop: 20,
    },
    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    scrollContent: {
        marginTop: 40,
        flexDirection: 'column',
        gap: 7,
    },
    assetContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    flexRowCenter: {
        flexDirection: 'row',
        gap: 7,
        alignItems: 'center',
    },
    flexColEnd: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    generateKey: {
        color: theme.colors.blue,
        fontSize: 11,
        textAlign: 'right',
    },
    textSize: {
        fontSize: 14,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },

    animationContainer: {
        marginBottom: 30,
    },
});
