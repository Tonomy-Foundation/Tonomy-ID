import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SelectAssetScreenNavigationProp } from '../screens/SelectAssetScreen';
import theme from '../utils/theme';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { appStorage, assetStorage, connect, keyStorage } from '../utils/StorageManager/setup';
import { capitalizeFirstLetter } from '../utils/strings';
import { VestingContract } from '@tonomy/tonomy-id-sdk';
import Debug from 'debug';
import useUserStore from '../store/userStore';
import { formatCurrencyValue } from '../utils/numbers';
import { supportedChains } from '../utils/assetDetails';
import { IPrivateKey } from '../utils/chain/types';
import { Images } from '../assets';
import { LEOS_SEED_ROUND_PRICE } from '../utils/chain/antelope';
import { useAppSettings } from '../context/AppSettingsContext';

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

    const { developerMode } = useAppSettings();

    const chains = useMemo(() => supportedChains, []);

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

    const handleOnPress = async (chainObj) => {
        if (type === 'receive') {
            navigation.navigate('Receive', {
                screenTitle: `Receive ${chainObj.token.getSymbol()}`,
                network: chainObj.chain.getName(),
            });
        } else if (type === 'send') {
            const key = await keyStorage.findByName(chainObj.keyName, chainObj.chain);

            navigation.navigate('Send', {
                screenTitle: `Send ${chainObj.token.getSymbol()}`,
                chain: chainObj.chain,
                privateKey: key as IPrivateKey,
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <Text style={styles.screenTitle}>select a currency to {type}</Text>
                    <View style={{ marginTop: 20, flexDirection: 'column', gap: 14 }}>
                        <TouchableOpacity
                            style={styles.assetsView}
                            onPress={() => {
                                if (type === 'receive') {
                                    navigation.navigate('Receive', {
                                        screenTitle: `Receive LEOS`,
                                        network: 'Pangea',
                                    });
                                } else {
                                    navigation.navigate('AssetDetail', {
                                        screenTitle: `LEOS`,
                                        network: 'Pangea',
                                    });
                                }
                            }}
                        >
                            <Image
                                source={Images.GetImage('logo1024')}
                                style={[styles.favicon, { resizeMode: 'contain' }]}
                            />
                            <View style={styles.assetContent}>
                                <View style={styles.flexRowCenter}>
                                    <View style={styles.flexRowCenter}>
                                        <Text style={{ fontSize: 16 }}>LEOS</Text>
                                        <View style={styles.assetsNetwork}>
                                            <Text style={{ fontSize: 12 }}>Pangea</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.flexColEnd}>
                                    <View style={styles.rowCenter}>
                                        <Text style={{ fontSize: 16 }}>
                                            {formatCurrencyValue(pangeaBalance, 4) || 0.0}
                                        </Text>
                                    </View>
                                    <Text style={styles.secondaryColor}>
                                        ${formatCurrencyValue(pangeaBalance * LEOS_SEED_ROUND_PRICE, 3)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        {chains.map((chainObj, index) => {
                            const chainName = capitalizeFirstLetter(chainObj.chain.getName());

                            const accountData = findAccountByChain(chainName);

                            if (chainObj.chain.getChainId() === '11155111' && !developerMode) {
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
                                            {chainObj.chain.getChainId() === '11155111' && (
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
