import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, RefreshControl } from 'react-native';
import { SelectAssetScreenNavigationProp } from '../screens/SelectAssetScreen';
import theme from '../utils/theme';
import { useMemo } from 'react';
import { capitalizeFirstLetter } from '../utils/strings';
import Debug from 'debug';
import { formatCurrencyValue } from '../utils/numbers';
import { TokenRegistryEntry, getKeyOrNullFromChain, tokenRegistry } from '../utils/tokenRegistry';
import useAppSettings from '../hooks/useAppSettings';
import useAssetManager from '../hooks/useAssetManager';
import TSpinner from '../components/atoms/TSpinner';

const debug = Debug('tonomy-id:containers:MainContainer');

const SelectAssetContainer = ({
    navigation,
    type,
}: {
    navigation: SelectAssetScreenNavigationProp['navigation'];
    type: string;
}) => {
    const { isAssetLoading, accounts, onRefresh, refreshBalance } = useAssetManager();

    const { developerMode } = useAppSettings();

    const tokens = useMemo(() => tokenRegistry, []);

    const findAccountByChain = (chain: string) => {
        const accountExists = accounts.find((account) => account.network === chain);
        const balance = accountExists?.balance;
        const usdBalance = accountExists?.usdBalance;
        const account = accountExists?.accountName;

        return { account, balance, usdBalance };
    };

    const handleOnPress = async (tokenEntry: TokenRegistryEntry) => {
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
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    refreshControl={<RefreshControl refreshing={refreshBalance} onRefresh={onRefresh} />}
                >
                    <Text style={styles.screenTitle}>select a currency to {type}</Text>
                    {!isAssetLoading ? (
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
                                            {refreshBalance ? (
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        paddingVertical: 10,
                                                    }}
                                                >
                                                    <TSpinner size={60} />
                                                </View>
                                            ) : (
                                                <View style={styles.flexColEnd}>
                                                    <View style={styles.rowCenter}>
                                                        <Text style={{ fontSize: 16 }}>{accountData.balance}</Text>
                                                    </View>
                                                    <Text style={styles.secondaryColor}>
                                                        ${formatCurrencyValue(accountData.usdBalance ?? 0)}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingVertical: 10,
                            }}
                        >
                            <TSpinner size={60} />
                        </View>
                    )}
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
