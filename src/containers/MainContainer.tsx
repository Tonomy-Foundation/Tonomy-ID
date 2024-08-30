/* eslint-disable indent */
/* eslint-disable camelcase */
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useRef, useState } from 'react';
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
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
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
import AccountDetails from '../components/AccountDetails';
import { MainScreenNavigationProp } from '../screens/MainScreen';
import useWalletStore from '../store/useWalletStore';
import { capitalizeFirstLetter } from '../utils/helper';
import Debug from 'debug';
import AccountSummary from '../components/AccountSummary';
import { APIClient, PrivateKey } from '@wharfkit/antelope';
import { ABICache } from '@wharfkit/abicache';
import zlib from 'pako';
import { SigningRequest, SigningRequestEncodingOptions } from '@wharfkit/signing-request';
import * as SecureStore from 'expo-secure-store';
import {
    ActionData,
    AntelopeChain,
    AntelopePrivateKey,
    AntelopeTransaction,
    EOSJungleChain,
    ESRSession,
    LEOS_PUBLIC_SALE_PRICE,
    PangeaMainnetChain,
    PangeaTestnetChain,
} from '../utils/chain/antelope';

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
    const [leosBalance, setLeosBalance] = useState(0);
    const [accountName, setAccountName] = useState('');
    const errorStore = useErrorStore();
    const [refreshing, setRefreshing] = React.useState(false);
    const [accountDetails, setAccountDetails] = useState<AccountDetails>({
        symbol: '',
        name: '',
        address: '',
    });
    const { web3wallet, ethereumAccount, initialized, sepoliaAccount, polygonAccount, initializeWalletState } =
        useWalletStore();

    const { ethereumBalance, sepoliaBalance, polygonBalance, updateBalance } = useWalletStore((state) => ({
        ethereumBalance: state.ethereumBalance,
        sepoliaBalance: state.sepoliaBalance,
        polygonBalance: state.polygonBalance,
        updateBalance: state.updateBalance,
    }));

    const refMessage = useRef(null);

    useEffect(() => {
        const initializeAndFetchBalances = async () => {
            if (!initialized && ethereumAccount && sepoliaAccount && polygonAccount) {
                await initializeWalletState();
            }
        };

        initializeAndFetchBalances();
    }, [initializeWalletState, initialized, ethereumAccount, sepoliaAccount, polygonAccount]);

    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, []);

    useEffect(() => {
        async function getUpdatedBalance() {
            await updateBalance();

            const vestedLeosBalance = await vestingContract.getBalance(accountName);

            if (leosBalance !== vestedLeosBalance) {
                setLeosBalance(vestedLeosBalance);
            }
        }

        getUpdatedBalance();

        const interval = setInterval(() => {
            getUpdatedBalance();
        }, 20000);

        return () => clearInterval(interval);
    }, [user, leosBalance, setLeosBalance, accountName, updateBalance]);

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

    async function onUrlOpen(did: string) {
        try {
            await connectToDid(did);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        } finally {
            onClose();
        }
    }

    async function onScan({ data }: BarCodeScannerResult) {
        try {
            if (data.startsWith('wc:')) {
                if (web3wallet) await web3wallet.core.pairing.pair({ uri: data });
            } else if (data.startsWith('esr:')) {
                let chain: AntelopeChain;

                if (settings.env === 'testnet') {
                    chain = PangeaTestnetChain;
                } else if (settings.env === 'production') {
                    chain = PangeaMainnetChain;
                } else {
                    chain = EOSJungleChain;
                }

                const client = new APIClient({ url: chain.getApiOrigin() });

                // Define the options used when decoding/resolving the request
                const options = {
                    abiProvider: new ABICache(client),
                    zlib,
                };

                // Decode a signing request payload
                const signingRequest = SigningRequest.from(data, options as unknown as SigningRequestEncodingOptions);
                const isIdentity = signingRequest.isIdentity();
                const privateKey = await SecureStore.getItemAsync('tonomy.id.key.PASSWORD');
                const abis = await signingRequest.fetchAbis();

                const authorization = {
                    actor: accountName,
                    permission: 'active',
                };

                const info = await client.v1.chain.get_info();
                const header = info.getTransactionHeader();

                // Resolve the transaction using the supplied data
                const resolvedSigningRequest = await signingRequest.resolve(abis, authorization, header);
                const createAssetAction: ActionData[] = resolvedSigningRequest.resolvedTransaction.actions.map(
                    (action) => ({
                        account: action.account.toString(),
                        name: action.name.toString(),
                        authorization: action.authorization.map((auth) => ({
                            actor: auth.actor.toString(),
                            permission: auth.permission.toString(),
                        })),
                        data: action.data,
                    })
                );
                const actions = createAssetAction;
                const privateKeyValue = privateKey || '';
                const transaction = AntelopeTransaction.fromActions(actions, EOSJungleChain);
                const antelopeKey = new AntelopePrivateKey(PrivateKey.from(privateKeyValue), EOSJungleChain);
                const session = new ESRSession();

                if (!isIdentity) {
                    navigation.navigate('SignTransaction', {
                        transaction,
                        privateKey: antelopeKey,
                        origin: chain.getApiOrigin(),
                        request: resolvedSigningRequest,
                        session,
                    });
                } else {
                    const signedTransaction = await antelopeKey.signTransaction(transaction);
                    const callbackParams = resolvedSigningRequest.getCallback(signedTransaction.signatures as any, 0);

                    if (callbackParams) {
                        const response = await fetch(callbackParams.url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(callbackParams?.payload),
                        });

                        if (!response.ok) {
                            throw new Error(`Failed to send callback: ${JSON.stringify(response)}`);
                        }
                    }
                    //TODO
                    // const session = new ESRSession(account, transaction, antelopeKey);

                    // navigation.navigate('WalletConnectLogin', {
                    //     payload: resolvedSigningRequest,
                    //     platform: 'browser',
                    //     session,
                    // });
                }
            } else {
                const did = validateQrCode(data);

                await connectToDid(did);
            }
        } catch (e) {
            if (e instanceof SdkError && e.code === SdkErrors.InvalidQrCode) {
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

    async function connectToDid(did: string) {
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
                throw e;
            }
        }
    }

    function onClose() {
        setQrOpened(false);
    }

    useEffect(() => {
        if (accountDetails?.address) {
            (refMessage?.current as any)?.open();
        }
    }, [accountDetails]);

    const updateAccountDetail = async (account) => {
        if (account) {
            const accountToken = await account.getNativeToken();
            const logoUrl = accountToken.getLogoUrl();

            setAccountDetails({
                symbol: accountToken.getSymbol(),
                name: capitalizeFirstLetter(account.getChain().getName()),
                address: account?.getName() || '',
                ...(logoUrl && { image: logoUrl }),
            });
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        updateBalance();
        setRefreshing(false);
    }, [updateBalance]);

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
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text> {formatCurrencyValue(leosBalance) || 0} LEOS</Text>
                                                    </View>
                                                    <Text style={styles.secondaryColor}>
                                                        $
                                                        {leosBalance
                                                            ? formatCurrencyValue(leosBalance * LEOS_PUBLIC_SALE_PRICE)
                                                            : 0.0}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <AccountSummary
                                        navigation={navigation}
                                        accountBalance={ethereumBalance}
                                        address={ethereumAccount}
                                        updateAccountDetail={updateAccountDetail}
                                        networkName="Ethereum"
                                    />
                                    <AccountSummary
                                        navigation={navigation}
                                        accountBalance={sepoliaBalance}
                                        address={sepoliaAccount}
                                        updateAccountDetail={updateAccountDetail}
                                        networkName="Sepolia"
                                    />
                                    <AccountSummary
                                        navigation={navigation}
                                        accountBalance={polygonBalance}
                                        address={polygonAccount}
                                        updateAccountDetail={updateAccountDetail}
                                        networkName="Polygon"
                                    />
                                </View>
                            </ScrollView>
                            <AccountDetails
                                refMessage={refMessage}
                                accountDetails={accountDetails}
                                onClose={() => {
                                    (refMessage.current as any)?.close();
                                    setAccountDetails({ symbol: '', icon: undefined, name: '', address: '' });
                                }}
                            />
                        </ScrollView>
                    </View>
                )}
                {qrOpened && <QrCodeScanContainer onScan={onScan} onClose={onClose} />}
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
});
