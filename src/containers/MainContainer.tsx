/* eslint-disable indent */
import { BarCodeScannerResult } from 'expo-barcode-scanner';
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
import { assetStorage, connect } from '../utils/StorageManager/setup';
import { IToken } from '../utils/chain/types';
import useNetworkStatus from '../utils/networkHelper';

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
    const { isConnected } = useNetworkStatus();
    const refMessage = useRef(null);

    // useEffect(() => {
    //     const initializeAndFetchBalances = async () => {
    //         if (!initialized && isConnected) {
    //             try {
    //                 progressiveRetryOnNetworkError(async () => await initializeWalletState());
    //             } catch (error) {
    //                 errorStore.setError({
    //                     error: new Error('Error initializing wallet'),
    //                     expected: true,
    //                 });
    //             }
    //         }
    //     };

    //     initializeAndFetchBalances();
    // }, [initializeWalletState, initialized, isConnected, errorStore]);

    const { updateBalance } = useWalletStore((state) => ({
        updateBalance: state.updateBalance,
    }));

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
                    debug('connectToDid error:', e);

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
                if (e.message === 'Network request failed') {
                    debug('network error when connectToDid called');
                } else {
                    debug('onUrlOpen error:', e);
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
                }
            }
        }

        if (isConnected) {
            getUpdatedBalance();

            const interval = setInterval(() => {
                getUpdatedBalance();
            }, 20000);

            return () => clearInterval(interval);
        }
    }, [pangeaBalance, setPangeaBalance, accountName, errorStore, updateBalance, accountExists, isConnected]);

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
                errorStore.setError({
                    title: 'Network Error',
                    error: new Error('Check your connection, and try again.'),
                    expected: true,
                });
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
                    error: e,
                    expected: false,
                    title: 'Communication Error',
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
            if (isConnected) {
                setRefreshBalance(true);
                await updateBalance();
                setRefreshBalance(false);
            }
        } catch (error) {
            setRefreshBalance(false);

            if (error.message === 'Network request failed') {
                debug('Error updating account detail network error:');
            }
        }
    }, [updateBalance, isConnected]);

    useEffect(() => {
        if (accountDetails?.address) {
            (refMessage?.current as any)?.open();
        }
    }, [accountDetails]);

    const AccountsView = () => {
        const chains = useMemo(
            () => [
                { token: ETHToken, chain: EthereumMainnetChain },
                { token: ETHSepoliaToken, chain: EthereumSepoliaChain },
                { token: ETHPolygonToken, chain: EthereumPolygonChain },
            ],
            []
        );

        const [accounts, setAccounts] = useState<
            { network: string; accountName: string | null; balance: string; usdBalance: number }[]
        >([]);

        const [refreshBalance, setRefreshBalance] = useState(false);

        useEffect(() => {
            const fetchAssets = async () => {
                try {
                    if (!accountExists) await initializeWalletAccount();
                    setRefreshBalance(true);
                    await connect();
                    const updatedAccounts = await Promise.all(
                        chains.map(async (chainObj) => {
                            const asset = await assetStorage.findAssetByName(chainObj.token);

                            return asset
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
                        })
                    );

                    setAccounts(updatedAccounts);
                    setRefreshBalance(false);
                } catch (error) {
                    setRefreshBalance(false);
                    debug('Error fetching asset:', error);
                }
            };

            fetchAssets();
        }, [chains]);

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
                                                        navigation.navigate('CreateEthereumKey');
                                                    }}
                                                    color={theme.colors.white}
                                                    size="medium"
                                                >
                                                    Generate key
                                                </TButton>
                                            ) : (
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-end',
                                                    }}
                                                >
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text>{accountData.balance}</Text>
                                                    </View>
                                                    <Text style={styles.secondaryColor}>
                                                        ${formatCurrencyValue(Number(accountData.usdBalance), 3)}
                                                    </Text>
                                                </View>
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
            <View>
                {!qrOpened && (
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
                )}
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
                <View style={{ flex: 1 }}>
                    {!qrOpened && (
                        <>
                            <View style={{ flexShrink: 0 }}>
                                <MainView />
                            </View>
                            <ScrollView
                                contentContainerStyle={styles.scrollViewContent}
                                refreshControl={<RefreshControl refreshing={refreshBalance} onRefresh={onRefresh} />}
                            >
                                <View style={styles.accountsView}>
                                    <Text style={styles.accountHead}>Connected Accounts:</Text>
                                    <TouchableOpacity
                                        onPress={() => {
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
                        </>
                    )}
                    {qrOpened && <QrCodeScanContainer onScan={onScan} onClose={() => setQrOpened(false)} />}

                    <AccountDetails
                        refMessage={refMessage}
                        accountDetails={accountDetails}
                        onClose={() => {
                            (refMessage.current as any)?.close();
                            setAccountDetails({ symbol: '', icon: undefined, name: '', address: '' });
                        }}
                    />
                </View>
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
        marginTop: 20,
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
        paddingHorizontal: 5,
    },
    balanceView: {
        marginTop: 7,
    },
    marginTop: {
        marginTop: 10,
    },
    generateKey: {
        width: '40%',
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
    },
});
