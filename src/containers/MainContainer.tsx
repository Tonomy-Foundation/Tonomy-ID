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
    Share,
    RefreshControl,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
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
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from '../components/TIconButton';
import QRCode from 'react-native-qrcode-svg';
import Popover from 'react-native-popover-view';

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
    const { web3wallet, initialized, initializeWalletState, accountExists, initializeWalletAccount } = useWalletStore();

    const { updateBalance } = useWalletStore((state) => ({
        updateBalance: state.updateBalance,
    }));
    const refRBSheet = useRef(null);

    // useEffect(() => {
    //     const initializeWeb3Wallet = async () => {
    //         try {
    //             if (!initialized && accountExists) {
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
    // }, [errorStore, initialized, initializeWalletState, accountExists]);

    // useEffect(() => {
    //     const fetchAccounts = async () => {
    //         debug('initializeAndFetchBalances', accountExists);

    //         try {
    //             if (!accountExists) {
    //                 debug('account not exists condition');
    //                 await initializeWalletAccount();
    //                 debug(`initializeAndFetchBalances try,  ${accountExists}`);
    //             }
    //         } catch (error) {
    //             debug('Error initializing wallet account:', error);
    //             errorStore.setError({
    //                 error: error,
    //                 expected: true,
    //             });
    //         }
    //     };

    //     fetchAccounts();
    // }, [errorStore, initializeWalletAccount, accountExists]);

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

        // if (did) {
        //     onUrlOpen(did);
        // }
    }, [setUserName, did, onUrlOpen]);

    // useEffect(() => {
    //     async function getUpdatedBalance() {
    //         try {
    //             if (ethereumAccount || sepoliaAccount || polygonAccount) await updateBalance();

    //             // const accountPangeaBalance = await vestingContract.getBalance(accountName);

    //             // if (pangeaBalance !== accountPangeaBalance) {
    //             //     setPangeaBalance(accountPangeaBalance);
    //             // }
    //         } catch (error) {
    //             debug('Error updating balance:', error);

    //             if (error.message === 'Network request failed') {
    //                 debug('netowrk error when call updating balance:');
    //             } else {
    //                 errorStore.setError({
    //                     error: error,
    //                     expected: true,
    //                 });
    //             }
    //         }
    //     }

    //     getUpdatedBalance();

    //     // const interval = setInterval(() => {
    //     //     getUpdatedBalance();
    //     // }, 20000);

    //     // return () => clearInterval(interval);
    // }, [
    //     pangeaBalance,
    //     setPangeaBalance,
    //     accountName,
    //     errorStore,
    //     updateBalance,
    //     ethereumAccount,
    //     sepoliaAccount,
    //     polygonAccount,
    // ]);

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
            } else {
                errorStore.setError({ error: e, expected: false });
            }
        } finally {
            onClose();
        }
    }

    // useEffect(() => {
    //     if (accountDetails?.address) {
    //         (refMessage?.current as any)?.open();
    //     }
    // }, [accountDetails]);

    // const updateAccountDetail = async (account) => {
    //     debug(`updateAccountDetail ${JSON.stringify(account, null, 2)}`);

    //     try {
    //         if (account) {
    //             const accountToken = await account.getNativeToken();
    //             const logoUrl = accountToken.getLogoUrl();

    //             setAccountDetails({
    //                 symbol: accountToken.getSymbol(),
    //                 name: capitalizeFirstLetter(account.getChain().getName()),
    //                 address: account?.getName() || '',
    //                 ...(logoUrl && { image: logoUrl }),
    //             });
    //             (refMessage.current as any)?.open();
    //         }
    //     } catch (error) {
    //         if (error.message === 'Network request failed') {
    //             debug('Error updating account detail network error:');
    //         } else {
    //             debug('Error updating account detail:', error);
    //             errorStore.setError({
    //                 error: error,
    //                 expected: true,
    //             });
    //         }
    //     }
    // };

    // const onRefresh = React.useCallback(async () => {
    //     try {
    //         setRefreshBalance(true);
    //         await updateBalance();
    //         setRefreshBalance(false);
    //     } catch (error) {
    //         if (error.message === 'Network request failed') {
    //             console.log('Error updating account detail network error:');
    //         } else {
    //             debug('Error when refresh balance:', error);
    //             errorStore.setError({
    //                 error: error,
    //                 expected: true,
    //             });
    //         }
    //     }
    // }, [updateBalance, errorStore]);
    debug('accountExists', accountExists);
    const chains = [
        { name: 'Ethereum', token: ETHToken },
        { name: 'Sepolia', token: ETHSepoliaToken },
        { name: 'Polygon', token: ETHPolygonToken },
    ];
    const AccountsView = () => {
        const [accounts, setAccount] = useState<
            { network: string; accountName: string | null; balance: string; usdBalance: number }[]
        >([]);
        const [accountLoading, setAccountLoading] = useState(false);
        // const [selectedAccount, setSelectedAccount] = useState(null);

        useEffect(() => {
            const fetchAssets = async () => {
                if (!accountExists) await initializeWalletAccount();
                debug('AccountView', accountExists);

                try {
                    setAccountLoading(true);
                    setAccount([
                        {
                            network: 'Ethereum',
                            accountName: '0x07B6F73eAFd36d3E651FeB768B9D4C05C8b36F54',
                            balance: '0',
                            usdBalance: 0,
                        },
                        {
                            network: 'Sepolia',
                            accountName: '0x07B6judeAFd36d3E651FeB768B9D4C05C8b36F54',
                            balance: '0',
                            usdBalance: 0,
                        },
                    ]);
                    // for (const chain of chains) {
                    //     debug('chain.token', chain.token);
                    //     const asset = await assetStorage.findAssetByName(chain.token);

                    //     debug('Asset:', asset);

                    //     if (asset) {
                    //         setAccount((prevAccounts) => [
                    //             ...prevAccounts,
                    //             {
                    //                 network: chain.name,
                    //                 accountName: asset.accountName,
                    //                 balance: asset.balance,
                    //                 usdBalance: asset.usdBalance,
                    //             },
                    //         ]);
                    //     } else {
                    //         setAccount((prevAccounts) => [
                    //             ...prevAccounts,
                    //             {
                    //                 network: chain.name,
                    //                 accountName: null,
                    //                 balance: '0' + chain.token.getSymbol(),
                    //                 usdBalance: 0,
                    //             },
                    //         ]);
                    //     }
                    // }

                    setAccountLoading(false);
                } catch (error) {
                    debug('Error fetching asset:', error);
                }
            };

            fetchAssets();
        }, [setAccount]);
        debug('accounts', accounts);

        const findAccountByChain = (chain: string) => {
            const accountExists = accounts.find((account) => account.network === chain);
            const balance = accountExists?.balance;
            const usdBalance = accountExists?.usdBalance;
            const account = accountExists?.accountName;

            return { account, balance, usdBalance };
        };

        // const openAccountDetails = (chain: any) => {
        //     const accountData = findAccountByChain(chain.name);

        //     setSelectedAccount({
        //         symbol: chain.token.getSymbol(),
        //         icon: chain.token.getLogoUrl(),
        //         network: chain.name,
        //         accountName: accountData.account,
        //     });
        //     (refRBSheet.current as any)?.open();
        // };

        return (
            <View>
                {accountLoading ? (
                    <View>
                        <TSpinner />
                    </View>
                ) : (
                    <>
                        {chains.map((chain, index) => {
                            const accountData = findAccountByChain(chain.name);

                            return (
                                <TouchableOpacity key={index}>
                                    <View style={[styles.appDialog, { justifyContent: 'center' }]}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image
                                                        source={{ uri: chain.token.getLogoUrl() }}
                                                        style={[styles.favicon, { resizeMode: 'contain' }]}
                                                    />
                                                    <Text style={styles.networkTitle}>{chain.name} Network:</Text>
                                                </View>
                                                {accountData.account ? (
                                                    <Text>
                                                        {accountData.account.substring(0, 7)}....
                                                        {accountData.account.substring(accountData.account.length - 6)}
                                                    </Text>
                                                ) : (
                                                    <Text>Not connected</Text>
                                                )}
                                            </View>
                                            {!accountData.account ? (
                                                <TButton
                                                    style={styles.generateKey}
                                                    onPress={() => {
                                                        debug('Generate key clicked');
                                                    }}
                                                    color={theme.colors.white}
                                                    size="medium"
                                                >
                                                    Generate key
                                                </TButton>
                                            ) : (
                                                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                                    <>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <Text>{accountData.balance}</Text>
                                                        </View>
                                                        <Text style={styles.secondaryColor}>
                                                            ${formatCurrencyValue(Number(accountData.usdBalance), 3)}
                                                        </Text>
                                                    </>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </>
                )}
            </View>
        );
    };

    const AccountDetailsView = (symbol, icon, network, accountName) => {
        const [showPopover, setShowPopover] = useState(false);

        const message = `${accountName}`;

        const copyToClipboard = () => {
            setShowPopover(true);
            Clipboard.setString(message);
            setTimeout(() => setShowPopover(false), 400);
        };

        const onShare = async () => {
            try {
                await Share.share({
                    message: message,
                });
            } catch (error) {
                alert(error.message);
            }
        };

        return (
            <RBSheet ref={refRBSheet} openDuration={150} closeDuration={100} height={560}>
                <View style={styles.rawTransactionDrawer}>
                    <Text style={styles.drawerHead}>Receive</Text>
                    <TouchableOpacity onPress={() => (refRBSheet.current as any)?.close()}>
                        <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.subHeading}>
                    Only send {symbol} assets to this address. Other assets will be lost forever.
                </Text>
                <View style={styles.networkHeading}>
                    <Image source={{ uri: icon }} style={styles.faviconIcon} />

                    <Text style={styles.networkTitleName}>{network} Network</Text>
                </View>
                <View style={{ ...styles.qrView, flexDirection: 'column' }}>
                    <QRCode value="testValue" size={150} />
                    <Text style={styles.accountName}>{accountName}</Text>
                </View>
                <View style={styles.iconContainer}>
                    <Popover
                        isVisible={showPopover}
                        popoverStyle={{ padding: 10 }}
                        from={
                            <TouchableOpacity style={styles.iconButton} onPress={() => copyToClipboard()}>
                                <TIconButton
                                    icon={'content-copy'}
                                    color={theme.colors.lightBg}
                                    iconColor={theme.colors.primary}
                                    size={24}
                                />
                                <Text style={styles.socialText}>Copy</Text>
                            </TouchableOpacity>
                        }
                    >
                        <Text>Message Copied</Text>
                    </Popover>
                    <TouchableOpacity onPress={() => onShare()}>
                        <TIconButton
                            icon={'share-variant'}
                            color={theme.colors.lightBg}
                            iconColor={theme.colors.primary}
                            size={24}
                        />
                        <Text style={styles.socialText}>Share</Text>
                    </TouchableOpacity>
                </View>
            </RBSheet>
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
                            // refreshControl={<RefreshControl refreshing={refreshBalance} onRefresh={onRefresh} />}
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
                                            // setAccountDetails({
                                            //     symbol: 'LEOS',
                                            //     name: 'Pangea',
                                            //     address: accountName,
                                            //     icon: Images.GetImage('logo48'),
                                            // });
                                            // (refMessage.current as any)?.open(); // Open the AccountDetails component here
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
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text> {formatCurrencyValue(pangeaBalance) || 0} LEOS</Text>
                                                    </View>
                                                    <Text style={styles.secondaryColor}>
                                                        $
                                                        {pangeaBalance
                                                            ? formatCurrencyValue(pangeaBalance * USD_CONVERSION)
                                                            : 0.0}
                                                    </Text>
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
