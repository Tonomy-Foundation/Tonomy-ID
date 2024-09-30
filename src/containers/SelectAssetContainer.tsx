import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SelectAssetScreenNavigationProp } from '../screens/SelectAsset';
import theme from '../utils/theme';

import { formatCurrencyValue } from '../utils/numbers';
import {
    EthereumMainnetChain,
    EthereumPolygonChain,
    EthereumSepoliaChain,
    ETHPolygonToken,
    ETHSepoliaToken,
    ETHToken,
    USD_CONVERSION,
} from '../utils/chain/etherum';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useUserStore from '../store/userStore';
import useWalletStore from '../store/useWalletStore';
import { CommunicationError, IdentifyMessage, VestingContract } from '@tonomy/tonomy-id-sdk';
import useErrorStore from '../store/errorStore';
import AssetItem from '../components/AssetItem';
import { useFocusEffect } from '@react-navigation/native';
import { appStorage, assetStorage, connect } from '../utils/StorageManager/setup';
import { capitalizeFirstLetter } from '../utils/strings';

import Debug from 'debug';
import { isNetworkError } from '../utils/errors';
import { progressiveRetryOnNetworkError } from '../utils/network';
const debug = Debug('tonomy-id:containers:MainContainer');
const vestingContract = VestingContract.Instance;

const SelectAssetContainer = ({
    navigation,
    type,
    did,
}: {
    navigation: SelectAssetScreenNavigationProp['navigation'];
    type: string;
    did?: string;
}) => {
    const userStore = useUserStore();
    const user = userStore.user;
    const errorStore = useErrorStore();

    const [accountName, setAccountName] = useState('');
    const [pangeaBalance, setPangeaBalance] = useState(0);
    const [username, setUsername] = useState('');
    const [qrOpened, setQrOpened] = useState<boolean>(false);

    const { accountExists, initializeWalletAccount, initialized, initializeWalletState } = useWalletStore();
    const [refreshBalance, setRefreshBalance] = useState(false);
    const { updateBalance: updateCryptoBalance } = useWalletStore((state) => ({
        updateBalance: state.updateBalance,
    }));

    const [accounts, setAccounts] = useState<
        { network: string; accountName: string | null; balance: string; usdBalance: number }[]
    >([]);

    const [developerMode, setDeveloperMode] = useState(true);
    const isUpdatingBalances = useRef(false);

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

    // initializeWalletState() on mount with progressiveRetryOnNetworkError()
    useEffect(() => {
        if (!initialized) {
            progressiveRetryOnNetworkError(initializeWalletState);
        }
    }, [initializeWalletState, initialized]);

    const fetchCryptoAssets = useCallback(async () => {
        try {
            if (!accountExists) await initializeWalletAccount();
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
                        balance: '0' + chainObj.token.getSymbol(),
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
    }, [accountExists, initializeWalletAccount, chains]);

    const updateLeosBalance = useCallback(async () => {
        try {
            debug('updateLeosBalance() fetching LEOS balance');
            if (accountExists) await updateCryptoBalance();

            const accountPangeaBalance = await vestingContract.getBalance(accountName);

            if (pangeaBalance !== accountPangeaBalance) {
                setPangeaBalance(accountPangeaBalance);
            }
        } catch (error) {
            debug('updateLeosBalance() error', error);

            if (isNetworkError(error)) {
                debug('updateLeosBalance() network error');
            }
        }
    }, [accountExists, updateCryptoBalance, accountName, pangeaBalance]);

    const updateAllBalances = useCallback(async () => {
        if (isUpdatingBalances.current) return; // Prevent re-entry if already running
        isUpdatingBalances.current = true;
        try {
            debug('updateAllBalances()');
            await updateLeosBalance();
            await updateCryptoBalance();
            await fetchCryptoAssets();
        } catch (error) {
            if (isNetworkError(error)) {
                debug('updateAllBalances() Error updating account detail network error:');
            } else {
                console.error('MainContainer() updateAllBalances() error', error);
            }
        } finally {
            isUpdatingBalances.current = false;
        }
    }, [updateCryptoBalance, fetchCryptoAssets, updateLeosBalance]);

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

    const findAccountByChain = (chain: string) => {
        const accountExists = accounts.find((account) => account.network === chain);
        const balance = accountExists?.balance;
        const usdBalance = accountExists?.usdBalance;
        const account = accountExists?.accountName;
        return { account, balance, usdBalance };
    };

    async function setUserName() {
        try {
            const u = await user.getUsername();

            setUsername(u.getBaseUsername());
            const accountName = (await user.getAccountName()).toString();

            setAccountName(accountName);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, []);

    const connectToDid = useCallback(
        async (did: string) => {
            try {
                // Connect to the browser using their did:jwk
                const issuer = await user.getIssuer();
                const identifyMessage = await IdentifyMessage.signMessage({}, issuer, did);

                await user.sendMessage(identifyMessage);
            } catch (e) {
                if (
                    e instanceof CommunicationError &&
                    e.exception?.status === 400 &&
                    e.exception.message.startsWith('Recipient not connected')
                ) {
                    errorStore.setError({
                        title: 'Problem connecting',
                        error: new Error("We couldn't connect to the website. Please refresh the page or try again."),
                        expected: true,
                    });
                } else {
                    debug('connectToDid() error:', e);

                    errorStore.setError({
                        error: e,
                        expected: false,
                    });
                }
            }
        },
        [user, errorStore]
    );

    const onUrlOpen = useCallback(
        async (did) => {
            try {
                await connectToDid(did);
            } catch (e) {
                if (isNetworkError(e)) {
                    debug('onUrlOpen() network error when connectToDid called');
                } else {
                    errorStore.setError({ error: e, expected: false });
                }
            } finally {
                onClose();
            }
        },
        [errorStore, connectToDid, onClose]
    );

    function onClose() {
        setQrOpened(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    refreshControl={<RefreshControl refreshing={refreshBalance} onRefresh={onRefresh} />}
                >
                    <Text style={styles.screenTitle}>select a currency to {type}</Text>
                    <View style={{ marginTop: 20, flexDirection: 'column', gap: 20 }}>
                        <AssetItem
                            type={type}
                            navigation={navigation}
                            networkName="Pangea"
                            currency="LEOS"
                            leos
                            accountBalance={{
                                balance: pangeaBalance.toString(),
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
