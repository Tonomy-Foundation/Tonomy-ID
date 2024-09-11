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
import { CommunicationError, IdentifyMessage } from '@tonomy/tonomy-id-sdk';
import { TButtonOutlined } from '../components/atoms/TButton';
import { TP } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';

import { SafeAreaView } from 'react-native-safe-area-context';
import useErrorStore from '../store/errorStore';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import TSpinner from '../components/atoms/TSpinner';

import theme from '../utils/theme';
import { Images } from '../assets';
import { VestingContract } from '@tonomy/tonomy-id-sdk';
import { formatCurrencyValue } from '../utils/numbers';
import { USD_CONVERSION } from '../utils/chain/etherum';
import AccountDetails from '../components/AccountDetails';
import { AssetsScreenNavigationProp } from '../screens/Assets';
import useWalletStore from '../store/useWalletStore';
import { capitalizeFirstLetter, progressiveRetryOnNetworkError } from '../utils/helper';
import Debug from 'debug';
import ArrowUpIcon from '../assets/icons/ArrowUpIcon';
import ArrowDownIcon from '../assets/icons/ArrowDownIcon';
import AssetsSummary from '../components/AssetsSummary';
import { appStorage } from '../utils/StorageManager/setup';

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
    const [refreshing, setRefreshing] = React.useState(false);
    const [accountDetails, setAccountDetails] = useState<AccountDetails>({
        symbol: '',
        name: '',
        address: '',
    });
    const [developerMode, setDeveloperMode] = React.useState(true);
    const { web3wallet, ethereumAccount, initialized, sepoliaAccount, polygonAccount, initializeWalletState } =
        useWalletStore();

    const { updateBalance } = useWalletStore((state) => ({
        updateBalance: state.updateBalance,
    }));

    useFocusEffect(
        useCallback(() => {
            const fetchSettings = async () => {
                const settings = await appStorage.findSettingByName('developerMode');
                const developerMode = settings?.value === 'true' ? true : false;
                setDeveloperMode(developerMode);
            };
            fetchSettings();
        }, [])
    );

    const refMessage = useRef(null);

    useEffect(() => {
        const initializeAndFetchBalances = async () => {
            if (!initialized && ethereumAccount && sepoliaAccount && polygonAccount) {
                try {
                    progressiveRetryOnNetworkError(async () => await initializeWalletState());
                } catch (error) {
                    errorStore.setError({
                        error: error,
                        expected: true,
                    });
                }
            }
        };

        initializeAndFetchBalances();
    }, [initializeWalletState, initialized, ethereumAccount, sepoliaAccount, polygonAccount, errorStore]);

    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, []);

    useEffect(() => {
        async function getUpdatedBalance() {
            await updateBalance();

            const accountPangeaBalance = await vestingContract.getBalance(accountName);

            if (pangeaBalance !== accountPangeaBalance) {
                setPangeaBalance(accountPangeaBalance);
            }
        }

        getUpdatedBalance();

        const interval = setInterval(() => {
            getUpdatedBalance();
        }, 20000);

        return () => clearInterval(interval);
    }, [user, pangeaBalance, setPangeaBalance, accountName, updateBalance]);

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

    const updateAccountDetail = async (account, balance) => {
        if (account) {
            const accountToken = await account.getNativeToken();
            const logoUrl = accountToken.getLogoUrl();

            const accountDetail = {
                symbol: accountToken.getSymbol(),
                name: capitalizeFirstLetter(account.getChain().getName()),
                account,
                ...(logoUrl && { image: logoUrl }),
            };

            navigation.navigate('AssetDetailMain', {
                screen: 'AssetDetail',
                params: { screenTitle: `${accountToken.getSymbol()}`, ...accountDetail, accountBalance: balance },
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
                <View style={styles.content}>
                    <ScrollView
                        contentContainerStyle={styles.scrollViewContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        <View style={styles.header}>
                            <Text style={styles.headerAssetsAmount}>$0.00</Text>
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
                                        const accountDetail = {
                                            symbol: 'LEOS',
                                            name: 'Pangea',
                                            address: accountName,
                                            icon: Images.GetImage('logo48'),
                                        };

                                        // navigation.navigate('AssetDetailMain', {
                                        //     screen: 'AssetDetail',
                                        //     params: {
                                        //         screenTitle: `${accountDetail.symbol}`,
                                        //         accountBalance: {
                                        //             balance: `${pangeaBalance} LEOS`,
                                        //             usdBalance: Number(pangeaBalance * USD_CONVERSION),
                                        //         },
                                        //         ...accountDetail,
                                        //     },
                                        // });
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
                                                    {formatCurrencyValue(pangeaBalance) || 0}
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

                                <AssetsSummary
                                    navigation={navigation}
                                    address={ethereumAccount}
                                    updateAccountDetail={updateAccountDetail}
                                    networkName="Ethereum"
                                    currency="ETH"
                                    storageName="ethereum"
                                />
                                {developerMode && (
                                    <AssetsSummary
                                        navigation={navigation}
                                        address={sepoliaAccount}
                                        updateAccountDetail={updateAccountDetail}
                                        networkName="Sepolia"
                                        currency="SepoliaETH"
                                        storageName="ethereumTestnetSepolia"
                                    />
                                )}
                                <AssetsSummary
                                    navigation={navigation}
                                    address={polygonAccount}
                                    updateAccountDetail={updateAccountDetail}
                                    networkName="Polygon"
                                    currency="MATIC"
                                    storageName="ethereumPolygon"
                                />
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
