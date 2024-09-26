import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    TouchableOpacity,
    ImageSourcePropType,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { CommunicationError, IdentifyMessage, SdkError, SdkErrors, validateQrCode } from '@tonomy/tonomy-id-sdk';
import { TButtonOutlined } from '../components/atoms/TButton';
import { TP } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';

import { SafeAreaView } from 'react-native-safe-area-context';
import useErrorStore from '../store/errorStore';
import { useIsFocused } from '@react-navigation/native';
import TSpinner from '../components/atoms/TSpinner';

import theme from '../utils/theme';
import { Images } from '../assets';
import { VestingContract } from '@tonomy/tonomy-id-sdk';
import { formatCurrencyValue } from '../utils/numbers';
import {
    EthereumChain,
    EthereumMainnetChain,
    EthereumPolygonChain,
    EthereumSepoliaChain,
    ETHPolygonToken,
    ETHSepoliaToken,
    ETHToken,
    USD_CONVERSION,
} from '../utils/chain/etherum';
import AccountDetails from '../components/AccountDetails';
import { AssetsScreenNavigationProp } from '../screens/Assets';
import useWalletStore from '../store/useWalletStore';
//import { capitalizeFirstLetter } from '../utils/helper';
import Debug from 'debug';
import ArrowUpIcon from '../assets/icons/ArrowUpIcon';
import ArrowDownIcon from '../assets/icons/ArrowDownIcon';
import AssetsSummary from '../components/AssetsSummary';
import { capitalizeFirstLetter } from '../utils/strings';
import { IToken } from '../utils/chain/types';
import { isNetworkError } from '../utils/errors';
import { assetStorage, connect } from '../utils/StorageManager/setup';
import settings from '../settings';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import { progressiveRetryOnNetworkError } from '../utils/network';

const debug = Debug('tonomy-id:containers:MainContainer');
const vestingContract = VestingContract.Instance;

interface AccountDetails {
    symbol: string;
    image?: string;
    name: string;
    address: string;
    icon?: ImageSourcePropType | undefined;
}

export default function AssetsContainer({
    did,
    navigation,
}: {
    did?: string;
    navigation: AssetsScreenNavigationProp['navigation'];
}) {
    const userStore = useUserStore();
    const user = userStore.user;
    const [username, setUsername] = useState('');
    const [qrOpened, setQrOpened] = useState<boolean>(false);
    const [isLoadingView, setIsLoadingView] = useState(false);
    const [pangeaBalance, setPangeaBalance] = useState(0);
    const [accountName, setAccountName] = useState('');
    const errorStore = useErrorStore();
    const [refreshBalance, setRefreshBalance] = useState(false);
    const [accountDetails, setAccountDetails] = useState<AccountDetails>({
        symbol: '',
        name: '',
        address: '',
    });
    const { web3wallet, accountExists, initializeWalletAccount, initialized, initializeWalletState } = useWalletStore();
    const refMessage = useRef(null);
    const isUpdatingBalances = useRef(false);
    const [accounts, setAccounts] = useState<
        { network: string; accountName: string | null; balance: string; usdBalance: number }[]
    >([]);
    const { updateBalance: updateCryptoBalance } = useWalletStore((state) => ({
        updateBalance: state.updateBalance,
    }));

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

    const onClose = useCallback(async () => {
        setQrOpened(false);
    }, []);

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

    const setUserName = useCallback(async () => {
        try {
            const u = await user.getUsername();

            setUsername(u.getBaseUsername());
            const accountName = (await user.getAccountName()).toString();

            setAccountName(accountName);
        } catch (e) {
            if (isNetworkError(e)) {
                debug('setUserName() network error');
            } else errorStore.setError({ error: e, expected: false });
        }
    }, [user, errorStore]);

    // setUserName() on mount
    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, [setUserName, did, onUrlOpen]);

    async function onScan({ data }: BarCodeScannerResult) {
        try {
            if (data.startsWith('wc:')) {
                if (web3wallet) await web3wallet.core.pairing.pair({ uri: data });
            } else {
                const did = validateQrCode(data);

                await connectToDid(did);
            }
        } catch (e) {
            debug('onScan() error:', e);

            if (isNetworkError(e)) {
                debug('onScan() network error');
                errorStore.setError({
                    title: 'Network Error',
                    error: new Error('Check your connection, and try again.'),
                    expected: true,
                });
            } else if (e instanceof SdkError && e.code === SdkErrors.InvalidQrCode) {
                debug('onScan() Invalid QR Code', JSON.stringify(e, null, 2));

                if (e.message === 'QR schema does not match app') {
                    errorStore.setError({
                        title: 'Invalid QR Code',
                        error: new Error(`This QR code cannot be used with ${settings.config.appName}`),
                        expected: true,
                    });
                } else {
                    errorStore.setError({
                        title: 'Invalid QR Code',
                        error: e,
                        expected: false,
                    });
                }
            } else if (e instanceof CommunicationError) {
                debug('onScan() CommunicationError QR Code', JSON.stringify(e, null, 2));
                errorStore.setError({
                    error: e,
                    expected: false,
                    title: 'Communication Error',
                });
            } else {
                onClose();
                errorStore.setError({ error: e, expected: false });
            }
        } finally {
            onClose();
        }
    }

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

    const fetchCryptoAssets = useCallback(async () => {
        try {
            if (!accountExists) await initializeWalletAccount();
            await connect();

            for (const chainObj of chains) {
                const asset = await assetStorage.findAssetByName(chainObj.token);

                debug(`fetchCryptoAssets() fetching asset for ${chainObj.chain.getName()}`);

                const account = asset
                    ? {
                          network: capitalizeFirstLetter(chainObj.chain.getName()),
                          accountName: asset.accountName,
                          balance: asset.balance,
                          usdBalance: asset.usdBalance,
                      }
                    : {
                          network: capitalizeFirstLetter(chainObj.chain.getName()),
                          accountName: null,
                          balance: '0' + chainObj.token.getSymbol(),
                          usdBalance: 0,
                      };

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

    // Open the AccountDetails component when accountDetails is set
    useEffect(() => {
        if (accountDetails?.address) {
            (refMessage?.current as any)?.open();
        }
    }, [accountDetails]);

    const findAccountByChain = (chain: string) => {
        const accountExists = accounts.find((account) => account.network === chain);
        const balance = accountExists?.balance;
        const usdBalance = accountExists?.usdBalance;
        const account = accountExists?.accountName;

        return { account, balance, usdBalance };
    };

    const openAccountDetails = ({ token, chain }: { token: IToken; chain: EthereumChain }) => {
        const accountData = findAccountByChain(capitalizeFirstLetter(chain.getName()));
        console.log(token.getSymbol())
        setAccountDetails({
            symbol: token.getSymbol(),
            name: capitalizeFirstLetter(chain.getName()),
            address: accountData.account || '',
            image: token.getLogoUrl(),
        });
        
        (refMessage.current as any)?.open();
    };

    const MainView = () => {
        const isFocused = useIsFocused();

        if (!isFocused) {
            return null;
        }

        return (
            <View style={styles.content}>
                <View style={styles.content}>
                    <ScrollView
                        contentContainerStyle={styles.scrollViewContent}
                        refreshControl={<RefreshControl refreshing={refreshBalance} onRefresh={onRefresh} />}
                    >
                        <View style={styles.header}>
                            <Text style={styles.headerAssetsAmount}>$341.00</Text>
                            <View style={styles.sendReceiveButtons}>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate('SelectAssetMain', {
                                            screen: 'SelectAsset',
                                            params: { did, type: 'send', screenTitle: 'Send' },
                                        })
                                    }
                                    style={styles.flexCenter}
                                >
                                    <View style={styles.headerButton}>
                                        <ArrowUpIcon />
                                    </View>
                                    <Text>Send</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate('SelectAssetMain', {
                                            screen: 'SelectAsset',
                                            params: { did, type: 'receive', screenTitle: 'Receive' },
                                        })
                                    }
                                    style={styles.flexCenter}
                                >
                                    <View style={styles.headerButton}>
                                        <ArrowDownIcon />
                                    </View>
                                    <Text>Receive</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <ScrollView>
                            <View style={styles.scrollContent}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setAccountDetails({
                                            symbol: 'LEOS',
                                            name: 'Pangea',
                                            address: accountName,
                                            icon: Images.GetImage('logo48'),
                                        });

                                        const accountDetail = {
                                            symbol: 'LEOS',
                                            name: 'Pangea',
                                            address: accountName,
                                            icon: Images.GetImage('logo48'),
                                        };

                                        navigation.navigate('AssetDetailMain', {
                                            screen: 'AssetDetail',
                                            params: {
                                                screenTitle: `${accountDetail.symbol}`,
                                                accountBalance: {
                                                    balance: `${pangeaBalance} LEOS`,
                                                    usdBalance: Number(pangeaBalance * USD_CONVERSION),
                                                },
                                                ...accountDetail,
                                            },
                                        });
                                    }}
                                    style={styles.assetsView}
                                >
                                    <Image source={Images.GetImage('logo1024')} style={styles.favicon} />
                                    <View style={styles.assetContent}>
                                        <View style={styles.flexRowCenter}>
                                            <Text style={{ fontSize: 16 }}>LEOS</Text>
                                            <View style={styles.assetsNetwork}>
                                                <Text style={{ fontSize: 13 }}>Pangea</Text>
                                            </View>
                                        </View>
                                        <View style={styles.flexColEnd}>
                                            <View style={styles.flexCenter}>
                                                <Text style={{ fontSize: 16 }}>
                                                    {formatCurrencyValue(pangeaBalance, 4) || 0}
                                                </Text>
                                            </View>
                                            <Text style={styles.secondaryColor}>
                                                $
                                                {pangeaBalance
                                                    ? formatCurrencyValue(pangeaBalance * USD_CONVERSION)
                                                    : 0.0}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {chains.map((chainObj, index) => {
                                    const accountData = findAccountByChain(
                                        capitalizeFirstLetter(chainObj.chain.getName())
                                    );
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                openAccountDetails(chainObj);

                                                const accountDetail = {
                                                    symbol: chainObj.token.getSymbol(),
                                                    name: capitalizeFirstLetter(chainObj.chain.getName()),
                                                    icon: { uri: chainObj.token.getLogoUrl() },
                                                    ...accountData,
                                                };
                                                console.log(accountData)
                                                // navigation.navigate('AssetDetailMain', {
                                                //     screen: 'AssetDetail',
                                                //     params: { screenTitle: `${chainObj.token.getSymbol()}`, ...accountDetail },
                                                // });
                                            }}
                                            style={styles.assetsView}
                                        >
                                            <Image
                                                source={{ uri: chainObj.token.getLogoUrl() }}
                                                style={[styles.favicon, { resizeMode: 'contain' }]}
                                            />
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    flex: 1,
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 16 }}>{chainObj.token.getSymbol()}</Text>
                                                    <View style={styles.assetsNetwork}>
                                                        <Text
                                                            style={{
                                                                fontSize: 10,
                                                            }}
                                                        >
                                                            {capitalizeFirstLetter(chainObj.chain.getName())}
                                                        </Text>
                                                    </View>
                                                    {chainObj.chain.getChainId() !== '1' && (
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
                                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    {accountData.account ? (
                                                        <View
                                                            style={{ flexDirection: 'column', alignItems: 'flex-end' }}
                                                        >
                                                            <View
                                                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                                            >
                                                                <Text style={{ fontSize: 16 }}>
                                                                    {accountData.balance}
                                                                </Text>
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
                                                                <Text style={{ fontSize: 16 }}>Not connected</Text>
                                                                <Text
                                                                    style={{ color: theme.colors.blue, fontSize: 13 }}
                                                                >
                                                                    Generate key
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </ScrollView>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {isLoadingView ? (
                <View style={styles.requestView}>
                    <Image source={require('../assets/tonomy/connecting.png')}></Image>
                    <TP style={styles.requestText} size={1}>
                        Linking to your web app and receiving data.
                    </TP>
                    <TSpinner style={{ marginBottom: 12 }} />
                    <TButtonOutlined onPress={() => setIsLoadingView(false)}>Cancel</TButtonOutlined>
                </View>
            ) : (
                <MainView />
            )}
        </SafeAreaView>
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
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    headerAssetsAmount: {
        fontSize: 40,
        fontWeight: '400',
        fontFamily: 'Roboto',
    },
    headerButton: {
        backgroundColor: theme.colors.grey7,
        width: 46,
        height: 46,
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
        width: 28,
        height: 28,
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
        gap: 5,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        padding: 16,
    },
    assetsNetwork: {
        backgroundColor: theme.colors.grey7,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    assetsTestnetNetwork: {
        backgroundColor: theme.colors.blue,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    sendReceiveButtons: {
        flexDirection: 'row',
        gap: 40,
        marginTop: 20,
    },
    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    scrollContent: {
        marginTop: 40,
        flexDirection: 'column',
        gap: 10,
    },
    assetContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    flexRowCenter: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    flexColEnd: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
});
