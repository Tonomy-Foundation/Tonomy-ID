/* eslint-disable indent */
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import TButton, { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { TH2, TP } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';
import QrCodeScanContainer from './QrCodeScanContainer';
import { SafeAreaView } from 'react-native-safe-area-context';
import useErrorStore from '../store/errorStore';
import { useIsFocused } from '@react-navigation/native';
import TSpinner from '../components/atoms/TSpinner';
import settings from '../settings';
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
import { MainScreenNavigationProp } from '../screens/MainScreen';
import useWalletStore from '../store/useWalletStore';
import { capitalizeFirstLetter, progressiveRetryOnNetworkError } from '../utils/helper';
import Debug from 'debug';
import { assetStorage } from '../utils/StorageManager/setup';
import { IToken } from '../utils/chain/types';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

const debug = Debug('tonomy-id:containers:MainContainer');
const vestingContract = VestingContract.Instance;

interface AccountDetails {
    symbol: string;
    image?: string;
    name: string;
    address: string;
    icon?: ImageSourcePropType | undefined;
}

export default function MainContainer({
    did,
    navigation,
}: {
    did?: string;
    navigation: MainScreenNavigationProp['navigation'];
}) {
    const chains = [
        { token: ETHToken, chain: EthereumMainnetChain },
        { token: ETHSepoliaToken, chain: EthereumSepoliaChain },
        { token: ETHPolygonToken, chain: EthereumPolygonChain },
    ];

    const [accounts, setAccount] = useState<
        { network: string; accountName: string | null; balance: string; usdBalance: number }[]
    >([]);
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
    const { web3wallet, initialized, initializeWalletState, accountExists, initializeWalletAccount } = useWalletStore();

    const { updateBalance } = useWalletStore((state) => ({
        updateBalance: state.updateBalance,
    }));
    const refMessage = useRef(null);
    // const [isOnline, setIsOnline] = useState(false);

    // useEffect(() => {
    //     const unsubscribe = NetInfo.addEventListener((state) => {
    //         debug('Connection type', state.type);
    //         if (state.type !== 'none' && state.type !== 'unknown') {
    //             setIsOnline(false);
    //         } else setIsOnline((state.isConnected && state.isInternetReachable) ?? false);
    //     });

    //     // Check initial connectivity status
    //     NetInfo.fetch().then((state) => {
    //         debug('Connection type fetch function', state.type);
    //         if (state.type !== 'none' && state.type !== 'unknown') {
    //             setIsOnline(false);
    //         } else setIsOnline((state.isConnected && state.isInternetReachable) ?? false);
    //     });

    //     return () => {
    //         unsubscribe();
    //     };
    // }, []);
    // useEffect(() => {
    //     const handleConnectivityChange = (state: NetInfoState) => {
    //         debug('Connection type', state.type);
    //         setIsOnline(state.isConnected && state.isInternetReachable ? true : false);
    //     };

    //     // Set up the event listener for connectivity changes
    //     const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    //     // Check initial connectivity status
    //     NetInfo.fetch().then((state) => {
    //         debug('Connection type fetch function', state.type);
    //         setIsOnline(state.isConnected && state.isInternetReachable ? true : false);
    //     });

    //     // Clean up the event listener
    //     return () => {
    //         unsubscribe();
    //     };
    // }, []);
    // debug('isOnline:', isOnline);
    // useEffect(() => {
    //     const initializeWeb3Wallet = async () => {
    //         try {
    //             if (!initialized && isOnline) {
    //                 debug('initialized if condition called');
    //                 await initializeWalletState();
    //             }
    //         } catch (error) {
    //             debug('Error initializing wallet account:', error);
    //             errorStore.setError({
    //                 error: error,
    //                 expected: true,
    //             });
    //         }
    //     };

    //     initializeWeb3Wallet();
    // }, [errorStore, initialized, initializeWalletState, isOnline]);

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
                debug('onUrlOpen error:', e);
                if (e.message === 'Network request failed') {
                    debug('network error when connectToDid called');
                } else errorStore.setError({ error: e, expected: false });
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
            if (e.message === 'Network request failed') {
                debug('Error getting username network error');
            } else errorStore.setError({ error: e, expected: false });
        }
    }, [user, errorStore]);

    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, [setUserName, did, onUrlOpen]);

    useEffect(() => {
        async function getUpdatedBalance() {
            try {
                if (accountExists) await updateBalance();

                const accountPangeaBalance = await vestingContract.getBalance(accountName);

                if (pangeaBalance !== accountPangeaBalance) {
                    setPangeaBalance(accountPangeaBalance);
                }
            } catch (error) {
                debug('Error updating balance:', error);

                if (error.message === 'Network request failed') {
                    debug('network error when call updating balance:');
                } else {
                    errorStore.setError({
                        error: error,
                        expected: true,
                    });
                }
            }
        }

        getUpdatedBalance();

        const interval = setInterval(() => {
            getUpdatedBalance();
        }, 20000);

        return () => clearInterval(interval);
    }, [pangeaBalance, setPangeaBalance, accountName, errorStore, updateBalance, accountExists]);

    async function onScan({ data }: BarCodeScannerResult) {
        try {
            if (data.startsWith('wc:')) {
                if (web3wallet) await web3wallet.core.pairing.pair({ uri: data });
            } else {
                const did = validateQrCode(data);

                await connectToDid(did);
            }
        } catch (e) {
            debug('onScan error:', e);

            if (e.message === 'Network request failed') {
                debug('Scan Qr Code network error');
            } else if (e instanceof SdkError && e.code === SdkErrors.InvalidQrCode) {
                debug('Invalid QR Code', JSON.stringify(e, null, 2));

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
                debug('CommunicationError QR Code', JSON.stringify(e, null, 2));

                errorStore.setError({
                    error: new Error(`Check your connection`),
                    expected: false,
                });
            } else {
                errorStore.setError({ error: e, expected: false });
            }
        } finally {
            onClose();
        }
    }

    const onRefresh = React.useCallback(async () => {
        try {
            await updateBalance();
        } catch (error) {
            if (error.message === 'Network request failed') {
                debug('Error updating account detail network error:');
            } else {
                debug('Error when refresh balance:', error);
                errorStore.setError({
                    error: error,
                    expected: true,
                });
            }
        }
    }, [updateBalance, errorStore]);

    useEffect(() => {
        if (accountDetails?.address) {
            (refMessage?.current as any)?.open();
        }
    }, [accountDetails]);

    useEffect(() => {
        const fetchAssets = async () => {
            if (!accountExists) await initializeWalletAccount();

            try {
                setRefreshBalance(true);

                for (const chainObj of chains) {
                    const asset = await assetStorage.findAssetByName(chainObj.token);

                    if (asset) {
                        setAccount((prevAccounts) => [
                            ...prevAccounts,
                            {
                                network: capitalizeFirstLetter(chainObj.chain.getName()),
                                accountName: asset.accountName,
                                balance: asset.balance,
                                usdBalance: asset.usdBalance,
                            },
                        ]);
                    } else {
                        setAccount((prevAccounts) => [
                            ...prevAccounts,
                            {
                                network: capitalizeFirstLetter(chainObj.chain.getName()),
                                accountName: null,
                                balance: '0' + chainObj.token.getSymbol(),
                                usdBalance: 0,
                            },
                        ]);
                    }
                }

                setRefreshBalance(false);
            } catch (error) {
                setRefreshBalance(false);
                debug('Error fetching asset:', error);
            }
        };

        fetchAssets();
    }, []);

    const findAccountByChain = (chain: string) => {
        const accountExists = accounts.find((account) => account.network === chain);
        const balance = accountExists?.balance;
        const usdBalance = accountExists?.usdBalance;
        const account = accountExists?.accountName;

        return { account, balance, usdBalance };
    };

    const openAccountDetails = ({ token, chain }: { token: IToken; chain: EthereumChain }) => {
        const accountData = findAccountByChain(capitalizeFirstLetter(chain.getName()));

        setAccountDetails({
            symbol: token.getSymbol(),
            name: capitalizeFirstLetter(chain.getName()),
            address: accountData.account || '',
            image: token.getLogoUrl(),
        });
        (refMessage.current as any)?.open();
    };

    const AccountsView = () => {
        return (
            <View>
                {chains.map((chainObj, index) => {
                    const accountData = findAccountByChain(capitalizeFirstLetter(chainObj.chain.getName()));

                    return (
                        <TouchableOpacity key={index} onPress={() => openAccountDetails(chainObj)}>
                            <View style={[styles.appDialog, { justifyContent: 'center' }]}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image
                                                source={{ uri: chainObj.token.getLogoUrl() }}
                                                style={[styles.favicon, { resizeMode: 'contain' }]}
                                            />
                                            <Text style={styles.networkTitle}>
                                                {capitalizeFirstLetter(chainObj.chain.getName())} Network:
                                            </Text>
                                        </View>
                                        {accountData.account ? (
                                            <Text> {chainObj.chain.formatShortAccountName(accountData.account)}</Text>
                                        ) : (
                                            <Text>Not connected</Text>
                                        )}
                                    </View>
                                    {refreshBalance ? (
                                        <TSpinner size="small" />
                                    ) : (
                                        <>
                                            {!accountData.account ? (
                                                <TButton
                                                    style={styles.generateKey}
                                                    onPress={() => {
                                                        debug('Generate key clicked');

                                                        navigation.navigate('CreateEthereumKey');
                                                    }}
                                                    color={theme.colors.white}
                                                    size="medium"
                                                >
                                                    Generate key
                                                </TButton>
                                            ) : (
                                                <>
                                                    <View
                                                        style={{
                                                            flexDirection: 'column',
                                                            alignItems: 'flex-end',
                                                        }}
                                                    >
                                                        <>
                                                            <View
                                                                style={{
                                                                    flexDirection: 'row',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <Text>{accountData.balance}</Text>
                                                            </View>
                                                            <Text style={styles.secondaryColor}>
                                                                $
                                                                {formatCurrencyValue(Number(accountData.usdBalance), 3)}
                                                            </Text>
                                                        </>
                                                    </View>
                                                </>
                                            )}
                                        </>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const MainView = () => {
        const isFocused = useIsFocused();

        if (!isFocused) {
            return null;
        }

        return (
            <View style={styles.content}>
                {!qrOpened && (
                    <View style={styles.content}>
                        <ScrollView
                            contentContainerStyle={styles.scrollViewContent}
                            refreshControl={<RefreshControl refreshing={refreshBalance} onRefresh={onRefresh} />}
                        >
                            <View style={styles.header}>
                                <TH2>{username}</TH2>

                                <Image
                                    source={require('../assets/animations/qr-code.gif')}
                                    style={[styles.image, styles.marginTop]}
                                />
                                <TButtonContained
                                    style={[styles.button, styles.marginTop]}
                                    icon="qrcode-scan"
                                    onPress={() => {
                                        setQrOpened(true);
                                    }}
                                >
                                    Scan QR Code
                                </TButtonContained>
                            </View>
                            <ScrollView>
                                <View style={styles.accountsView}>
                                    <Text style={styles.accountHead}>Connected Accounts:</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            debug('Pangea account clicked', accountName, Images.GetImage('logo48'));
                                            setAccountDetails({
                                                symbol: 'LEOS',
                                                name: 'Pangea',
                                                address: accountName,
                                                icon: Images.GetImage('logo48'),
                                            });
                                            (refMessage.current as any)?.open(); // Open the AccountDetails component here
                                        }}
                                    >
                                        <View style={[styles.appDialog, { justifyContent: 'center' }]}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Image
                                                            source={Images.GetImage('logo48')}
                                                            style={styles.favicon}
                                                        />
                                                        <Text style={styles.networkTitle}>Pangea Network:</Text>
                                                    </View>
                                                    <Text>{accountName}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    {refreshBalance ? (
                                                        <TSpinner size="small" />
                                                    ) : (
                                                        <>
                                                            <View
                                                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                                            >
                                                                <Text>
                                                                    {formatCurrencyValue(pangeaBalance) || 0} LEOS
                                                                </Text>
                                                            </View>
                                                            <Text style={styles.secondaryColor}>
                                                                $
                                                                {pangeaBalance
                                                                    ? formatCurrencyValue(
                                                                          pangeaBalance * USD_CONVERSION
                                                                      )
                                                                    : 0.0}
                                                            </Text>
                                                        </>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    <AccountsView />
                                </View>
                            </ScrollView>
                            {/* <AccountDetails
                                refMessage={refMessage}
                                accountDetails={accountDetails}
                                onClose={() => {
                                    (refMessage.current as any)?.close();
                                    setAccountDetails({ symbol: '', icon: undefined, name: '', address: '' });
                                }}
                            /> */}
                        </ScrollView>
                    </View>
                )}
                {qrOpened && <QrCodeScanContainer onScan={onScan} onClose={() => setQrOpened(false)} />}
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
        color: theme.colors.secondary2,
    },
    favicon: {
        width: 13,
        height: 13,
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
    generateKey: {
        width: '40%',
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
    },

    // RBSheet style
    rawTransactionDrawer: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    drawerHead: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 8,
    },
    subHeading: {
        backgroundColor: theme.colors.lightBg,
        marginHorizontal: 15,
        padding: 10,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 18,
    },
    networkHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        justifyContent: 'center',
    },
    networkTitleName: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    faviconIcon: {
        width: 18,
        height: 18,
        marginRight: 5,
    },
    qrView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        justifyContent: 'center',
        borderColor: theme.colors.grey6,
        borderWidth: 2,
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 70,
    },
    accountName: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 10,
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    iconButton: {
        marginHorizontal: 25,
    },
    socialText: {
        fontSize: 12,
        color: theme.colors.primary,
        textAlign: 'center',
        fontWeight: '500',
    },
});
