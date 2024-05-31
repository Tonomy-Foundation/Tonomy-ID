import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { CommunicationError, IdentifyMessage, SdkError, SdkErrors, validateQrCode } from '@tonomy/tonomy-id-sdk';
import TButton, { TButtonContained, TButtonOutlined, TButtonText } from '../components/atoms/TButton';
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
import { _pair, currentETHAddress } from '../services/WalletConnect/WalletConnectModule';
import useInitialization from '../hooks/useWalletConnect';
import { useNavigation } from '@react-navigation/native';
import { USD_CONVERSION } from '../utils/chain/etherum';

const vestingContract = VestingContract.Instance;

export default function MainContainer({ did }: { did?: string }) {
    const userStore = useUserStore();
    const user = userStore.user;
    const [username, setUsername] = useState('');
    const [qrOpened, setQrOpened] = useState<boolean>(false);
    const [isLoadingView, setIsLoadingView] = useState(false);
    const [balance, setBalance] = useState(0);
    const [accountName, setAccountName] = useState('');
    const errorStore = useErrorStore();
    const { initialized, web3wallet } = useInitialization();
    const navigation = useNavigation();

    useEffect(() => {
        console.log('Web3WalletSDK initialized:', initialized);
    }, [initialized]);

    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, []);

    useEffect(() => {
        async function getUpdatedBalance() {
            const accountBalance = await vestingContract.getBalance(accountName);

            if (balance !== accountBalance) {
                setBalance(accountBalance);
            }
        }

        getUpdatedBalance();

        const interval = setInterval(() => {
            getUpdatedBalance();
        }, 20000);

        return () => clearInterval(interval);
    }, [user, balance, setBalance, accountName]);

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
                await _pair(data);
            } else if (data.startsWith('did:')) {
                const did = validateQrCode(data);

                await connectToDid(did);
            } else {
                errorStore.setError({
                    title: 'Invalid QR Code',
                    error: new Error(`This is not a supported QR code.`),
                    expected: false,
                });
            }
        } catch (e) {
            if (e instanceof SdkError && e.code === SdkErrors.InvalidQrCode) {
                console.log('Invalid QR Code', JSON.stringify(e, null, 2));

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

    const MainView = () => {
        const isFocused = useIsFocused();

        if (!isFocused) {
            return null;
        }

        return (
            <View style={styles.content}>
                {!qrOpened && (
                    <View style={styles.content}>
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

                        <View style={styles.accountsView}>
                            <Text style={styles.accountHead}>Connected Accounts:</Text>
                            <View style={[styles.appDialog, { justifyContent: 'center' }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image source={Images.GetImage('logo48')} style={styles.favicon} />
                                            <Text style={styles.networkTitle}>Pangea Network:</Text>
                                        </View>
                                        <Text>{accountName}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text> {formatCurrencyValue(balance) || 0} LEOS</Text>
                                        </View>
                                        <Text style={styles.secondaryColor}>
                                            ${balance ? formatCurrencyValue(balance * USD_CONVERSION) : 0.0}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.appDialog, { justifyContent: 'center' }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image
                                                source={require('../assets/icons/eth-img.png')}
                                                style={styles.favicon}
                                            />
                                            <Text style={styles.networkTitle}>Ethereum Network:</Text>
                                        </View>
                                        {currentETHAddress ? (
                                            <Text>
                                                {currentETHAddress.substring(0, 7)}....
                                                {currentETHAddress.substring(currentETHAddress.length - 6)}
                                            </Text>
                                        ) : (
                                            <Text>Not connected</Text>
                                        )}
                                    </View>
                                    {!initialized && web3wallet === null ? (
                                        <TButton
                                            style={styles.generateKey}
                                            onPress={() => navigation.navigate('CreateEthereumKey')}
                                            color={theme.colors.white}
                                            size="medium"
                                        >
                                            Generate key
                                        </TButton>
                                    ) : (
                                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text> {formatCurrencyValue(balance) || 0} ETH</Text>
                                            </View>
                                            <Text style={styles.secondaryColor}>
                                                ${balance ? formatCurrencyValue(balance * USD_CONVERSION) : 0.0}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
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
});
