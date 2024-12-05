import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SelectAssetScreenNavigationProp } from '../screens/SelectAssetScreen';
import theme from '../utils/theme';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { assetStorage, connect } from '../utils/StorageManager/setup';
import { capitalizeFirstLetter } from '../utils/strings';
import DebugAndLog from '../utils/debug';
import { formatCurrencyValue } from '../utils/numbers';
import { TokenRegistryEntry, getKeyOrNullFromChain, tokenRegistry } from '../utils/tokenRegistry';
import useAppSettings from '../hooks/useAppSettings';
import useErrorStore from '../store/errorStore';

const debug = DebugAndLog('tonomy-id:containers:MainContainer');

const SelectAssetContainer = ({
    navigation,
    type,
}: {
    navigation: SelectAssetScreenNavigationProp['navigation'];
    type: string;
}) => {
    const [accounts, setAccounts] = useState<
        { network: string; accountName: string | null; balance: string; usdBalance: number }[]
    >([]);

    const errorStore = useErrorStore();
    const { developerMode } = useAppSettings();

    const tokens = useMemo(() => tokenRegistry, []);

    const fetchCryptoAssets = useCallback(async () => {
        try {
            await connect();

            for (const { chain, token } of tokens) {
                const asset = await assetStorage.findAssetByName(token);

                debug(`fetchCryptoAssets() fetching asset for ${chain.getName()}`);
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
            }
        } catch (error) {
            debug('fetchCryptoAssets() error', error);
        }
    }, [tokens]);

    useEffect(() => {
        fetchCryptoAssets();

        const interval = setInterval(fetchCryptoAssets, 10000);

        return () => clearInterval(interval);
    }, [fetchCryptoAssets]);

    const findAccountByChain = (chain: string) => {
        const accountExists = accounts.find((account) => account.network === chain);
        const balance = accountExists?.balance;
        const usdBalance = accountExists?.usdBalance;
        const account = accountExists?.accountName;

        return { account, balance, usdBalance };
    };

    const handleOnPress = async (tokenEntry: TokenRegistryEntry) => {
        try {
            if (type === 'receive') {
                navigation.navigate('Receive', {
                    screenTitle: `Receive ${tokenEntry.token.getSymbol()}`,
                    chain: tokenEntry.chain,
                });
            } else if (type === 'send') {
                const key = await getKeyOrNullFromChain(tokenEntry);

                if (!key) {
                    debug(`handleOnPress() ${tokenEntry.keyName} key not found`);
                    return;
                }

                navigation.navigate('Send', {
                    screenTitle: `Send ${tokenEntry.token.getSymbol()}`,
                    chain: tokenEntry.chain,
                    privateKey: key,
                });
            }
        } catch (error) {
            errorStore.setError({ error, expected: false });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <Text style={styles.screenTitle}>select a currency to {type}</Text>
                    <View style={{ marginTop: 20, flexDirection: 'column', gap: 14 }}>
                        {tokens.map((chainObj, index) => {
                            const chainName = capitalizeFirstLetter(chainObj.chain.getName());

                            const accountData = findAccountByChain(chainName);

                            if (chainObj.chain.isTestnet() && !developerMode) {
                                return null;
                            }

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.assetsView}
                                    onPress={() => handleOnPress(chainObj)}
                                >
                                    <Image
                                        source={{ uri: chainObj.token.getLogoUrl() }}
                                        style={[styles.favicon, { resizeMode: 'contain' }]}
                                    />
                                    <View style={styles.assetContent}>
                                        <View style={styles.flexRowCenter}>
                                            <View style={styles.flexRowCenter}>
                                                <Text style={{ fontSize: 16 }}>{chainObj.token.getSymbol()}</Text>
                                                <View style={styles.assetsNetwork}>
                                                    <Text style={{ fontSize: 12 }}> {chainName}</Text>
                                                </View>
                                            </View>
                                            {chainObj.chain.isTestnet() && (
                                                <View style={styles.assetsTestnetNetwork}>
                                                    <Text
                                                        style={{
                                                            fontSize: 10,
                                                            color: theme.colors.white,
                                                        }}
                                                    >
                                                        Testnet
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.flexColEnd}>
                                            <View style={styles.rowCenter}>
                                                <Text style={{ fontSize: 16 }}>{accountData.balance}</Text>
                                            </View>
                                            <Text style={styles.secondaryColor}>
                                                ${formatCurrencyValue(accountData.usdBalance ?? 0)}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
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
    assetsTestnetNetwork: {
        backgroundColor: theme.colors.blue,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    assetContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    flexRowCenter: {
        flexDirection: 'row',
        gap: 3,
        alignItems: 'center',
    },
    flexColEnd: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default SelectAssetContainer;
