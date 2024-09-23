/* eslint-disable indent */
/* eslint-disable camelcase */
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
    SafeAreaView,
} from 'react-native';
import { CommunicationError, IdentifyMessage, SdkError, SdkErrors, validateQrCode } from '@tonomy/tonomy-id-sdk';
import TButton, { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { TH2, TP } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';
import QrCodeScanContainer from './QrCodeScanContainer';
import useErrorStore from '../store/errorStore';
import { useIsFocused } from '@react-navigation/native';
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
import { progressiveRetryOnNetworkError } from '../utils/network';
import { capitalizeFirstLetter } from '../utils/strings';
import Debug from 'debug';
import { APIClient, PrivateKey } from '@wharfkit/antelope';
import { ABICache } from '@wharfkit/abicache';
import zlib from 'pako';
import { AbiProvider, SigningRequest, SigningRequestEncodingOptions } from '@wharfkit/signing-request';
import * as SecureStore from 'expo-secure-store';
import {
    ActionData,
    ANTELOPE_CHAIN_ID_TO_CHAIN,
    AntelopeAccount,
    AntelopeChain,
    AntelopePrivateKey,
    AntelopeTransaction,
    EOSJungleChain,
    ESRSession,
    LEOS_SEED_ROUND_PRICE,
} from '../utils/chain/antelope';
import { assetStorage, connect } from '../utils/StorageManager/setup';
import { IToken } from '../utils/chain/types';
import { isNetworkError, NETWORK_ERROR_RESPONSE } from '../utils/errors';
import TSpinner from '../components/atoms/TSpinner';

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
        debug('onScan() data:', data);

        try {
            if (data.startsWith('wc:')) {
                if (web3wallet) await web3wallet.core.pairing.pair({ uri: data });
            } else if (data.startsWith('esr:')) {
                // eslint-disable-next-line no-inner-declarations
                async function createMockSigningRequest() {
                    return await SigningRequest.create(
                        {
                            actions: [
                                {
                                    account: 'eosio.token',
                                    name: 'transfer',
                                    authorization: [
                                        {
                                            actor: 'jacktest2222',
                                            permission: 'active',
                                        },
                                    ],
                                    data: {
                                        from: 'jacktest2222',
                                        to: 'hippopotamus',
                                        quantity: '1.0000 EOS',
                                        memo: '',
                                    },
                                },
                                {
                                    account: 'eosio.token',
                                    name: 'close',
                                    authorization: [
                                        {
                                            actor: 'jacktest2222',
                                            permission: 'active',
                                        },
                                    ],
                                    data: {
                                        owner: 'jacktest2222',
                                        symbol: '4,EOS',
                                    },
                                },
                            ],
                            callback: 'https://tonomy.io',
                            chainId: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
                        },
                        {
                            abiProvider: new ABICache(
                                new APIClient({
                                    url: 'https://jungle4.cryptolions.io',
                                })
                            ) as unknown as AbiProvider,
                            zlib,
                        }
                    );
                }

                const request = await createMockSigningRequest();
                const signingRequestBasic = SigningRequest.from(request.toString(), { zlib });
                // const signingRequestBasic = SigningRequest.from(data, { zlib });

                const chain: AntelopeChain = ANTELOPE_CHAIN_ID_TO_CHAIN[signingRequestBasic.getChainId().toString()];

                if (!chain) throw new Error('This chain is not supported');
                const client = new APIClient({ url: chain.getApiOrigin() });

                // Define the options used when decoding/resolving the request
                const options: SigningRequestEncodingOptions = {
                    abiProvider: new ABICache(client) as unknown as AbiProvider,
                    zlib,
                };

                // Decode a signing request payload
                const signingRequest = SigningRequest.from(signingRequestBasic.toString(), options);

                const isIdentity = signingRequest.isIdentity();
                const privateKey = await SecureStore.getItemAsync('tonomy.id.key.PASSWORD');
                // const privateKey = '5Hw7gAxYHruqAtwBcVjFUHS79A2A4QmVL2ModVgdhE12NpCpLdr';
                const abis = await signingRequest.fetchAbis();

                if (!privateKey) throw new Error('No private key found');

                const authorization = {
                    actor: accountName,
                    permission: 'active',
                };

                const info = await client.v1.chain.get_info();
                const header = info.getTransactionHeader();

                // Resolve the transaction using the supplied data
                const resolvedSigningRequest = await signingRequest.resolve(abis, authorization, header);
                const actions = resolvedSigningRequest.resolvedTransaction.actions.map((action) => ({
                    account: action.account.toString(),
                    name: action.name.toString(),
                    authorization: action.authorization.map((auth) => ({
                        actor: auth.actor.toString(),
                        permission: auth.permission.toString(),
                    })),
                    data: action.data,
                }));

                const account = AntelopeAccount.fromAccount(EOSJungleChain, 'jacktest2222');
                const transaction = AntelopeTransaction.fromActions(actions, EOSJungleChain, account);
                const antelopeKey = new AntelopePrivateKey(PrivateKey.from(privateKey), EOSJungleChain);
                const session = new ESRSession(antelopeKey, chain);

                const callback = resolvedSigningRequest.request.data.callback;
                const origin = new URL(callback).origin;

                debug('onScan() transaction:', transaction);

                if (!isIdentity) {
                    navigation.navigate('SignTransaction', {
                        transaction,
                        privateKey: antelopeKey,
                        origin,
                        request: resolvedSigningRequest,
                        session,
                    });
                } else {
                    debug('Identity request not supported yet');
                    return;
                    // const signedTransaction = await antelopeKey.signTransaction(transaction);
                    // const callbackParams = resolvedSigningRequest.getCallback(signedTransaction.signatures as any, 0);

                    // if (callbackParams) {
                    //     const response = await fetch(callbackParams.url, {
                    //         method: 'POST',
                    //         headers: {
                    //             'Content-Type': 'application/json',
                    //         },
                    //         body: JSON.stringify(callbackParams?.payload),
                    //     });

                    //     if (!response.ok) {
                    //         throw new Error(`Failed to send callback: ${JSON.stringify(response)}`);
                    //     }
                    // }
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
            debug('onScan() error:', e);

            if (isNetworkError(e)) {
                debug('onScan() network error');
                errorStore.setError({
                    title: 'Network Error',
                    error: new Error(NETWORK_ERROR_RESPONSE),
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
                                                        <Text> {formatCurrencyValue(pangeaBalance, 4) || 0} LEOS</Text>
                                                    </View>
                                                    <Text style={styles.secondaryColor}>
                                                        $
                                                        {pangeaBalance
                                                            ? formatCurrencyValue(pangeaBalance * LEOS_SEED_ROUND_PRICE)
                                                            : 0.0}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <View>
                                        {chains.map((chainObj, index) => {
                                            const accountData = findAccountByChain(
                                                capitalizeFirstLetter(chainObj.chain.getName())
                                            );

                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => openAccountDetails(chainObj)}
                                                >
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
                                                                <View
                                                                    style={{
                                                                        flexDirection: 'row',
                                                                        alignItems: 'center',
                                                                    }}
                                                                >
                                                                    <Image
                                                                        source={{ uri: chainObj.token.getLogoUrl() }}
                                                                        style={[
                                                                            styles.favicon,
                                                                            { resizeMode: 'contain' },
                                                                        ]}
                                                                    />
                                                                    <Text style={styles.networkTitle}>
                                                                        {capitalizeFirstLetter(
                                                                            chainObj.chain.getName()
                                                                        )}{' '}
                                                                        Network:
                                                                    </Text>
                                                                </View>
                                                                {accountData.account ? (
                                                                    <Text>
                                                                        {' '}
                                                                        {chainObj.chain.formatShortAccountName(
                                                                            accountData.account
                                                                        )}
                                                                    </Text>
                                                                ) : (
                                                                    <Text>Not connected</Text>
                                                                )}
                                                            </View>
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
                                                                            {formatCurrencyValue(
                                                                                accountData.usdBalance ?? 0
                                                                            )}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
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
    content: {
        flex: 1,
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
        marginTop: 10,
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
