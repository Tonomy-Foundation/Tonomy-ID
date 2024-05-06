import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { CommunicationError, IdentifyMessage, SdkError, SdkErrors, validateQrCode } from '@tonomy/tonomy-id-sdk';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { TH2, TP } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';
import QrCodeScanContainer from './QrCodeScanContainer';
import { SafeAreaView } from 'react-native-safe-area-context';
import useErrorStore from '../store/errorStore';
import { useIsFocused } from '@react-navigation/native';
import TCard from '../components/TCard';
import TSpinner from '../components/atoms/TSpinner';
import settings from '../settings';
import Web3 from 'web3';
import SignClient from '@walletconnect/sign-client';

export default function MainContainer({ did }: { did?: string }) {
    const userStore = useUserStore();
    const user = userStore.user;
    const [username, setUsername] = useState('');
    const [qrOpened, setQrOpened] = useState<boolean>(false);
    const [isLoadingView, setIsLoadingView] = useState(false);
    const errorStore = useErrorStore();
    const web3 = new Web3('http://localhost:8545');

    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, []);

    async function setUserName() {
        try {
            const u = await user.getUsername();

            setUsername(u.getBaseUsername());
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
            console.log('data', data);
            await connectToWalletConnect(data);
            // const did = validateQrCode(data);

            // await connectToDid(did);
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

    async function connectToWalletConnect(did: string) {
        console.log('connect TO wallet connect', did);
        // Replace with your actual private key
        const privateKey = '0xc7709ab54044f7a97d8b3d006c404644a15286c7cc13e7a597353a405610e690'.trim();

        const account = web3.eth.accounts.privateKeyToAccount(
            '0xc7709ab54044f7a97d8b3d006c404644a15286c7cc13e7a597353a405610e690'
        );

        console.log('account', account, JSON.stringify(account.addresss));

        // const core = new Core({
        //     projectId: '2850896ad9cf6c1d958203b00b199c2d',
        // });

        try {
            console.log('create client');
            const client = await SignClient.init({
                projectId: '2850896ad9cf6c1d958203b00b199c2d',
                relayUrl: 'wss://relay.walletconnect.com',
            });

            console.log('client', client);
            // setSignClient(client);
            // await subscribeToEvents(client);
        } catch (e) {
            console.log(e);
        }

        // const web3wallet = await Web3Wallet.init({
        //     core,
        //     metadata: {
        //         name: 'Demo app',
        //         description: 'Demo Client as Wallet/Peer',
        //         url: 'www.walletconnect.com',
        //         icons: [],
        //         redirect: {
        //             native: 'tonomy-id-development://',
        //         },
        //     },
        // });

        // await web3wallet.pair({ uri: did });

        // web3wallet.on('session_proposal', async (proposal) => {
        //     console.log('proposal', proposal);

        //     try {
        //         const approvedNamespaces = buildApprovedNamespaces({
        //             proposal: proposal.params,
        //             supportedNamespaces: {
        //                 eip155: {
        //                     chains: ['eip155:11155111'], //11155111
        //                     methods: ['eth_sendTransaction', 'personal_sign'],
        //                     events: ['accountsChanged', 'chainChanged'],
        //                     accounts: ['eip155:11155111:0x253c8d99c27d47A4DcdB04B40115AB1dAc466280'],
        //                 },
        //             },
        //         });
        //         const session = await web3wallet.approveSession({
        //             id: proposal.id,
        //             namespaces: approvedNamespaces,
        //         });

        //         console.log('session', session);
        //     } catch (error) {
        //         console.log('error', error);
        //         await web3wallet.rejectSession({
        //             id: proposal.id,
        //             reason: getSdkError('USER_REJECTED'),
        //         });
        //     }
        // });
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

                        <View style={[styles.marginTop, styles.card]}>
                            <TP size={2}>SUGGESTED APPS:</TP>
                            <ScrollView horizontal={true} style={styles.scrollView}>
                                <TCard style={styles.card}>
                                    <TCard.Cover source={require('../assets/images/tonomy-dao.png')} />
                                    <TCard.Badge>Coming Soon</TCard.Badge>
                                    <TCard.Content>
                                        <TP>Tonomy Participate</TP>
                                    </TCard.Content>
                                </TCard>
                                <TCard style={styles.card}>
                                    <TCard.Cover source={require('../assets/images/tonomy-p.png')} />
                                    <TCard.Badge>Coming Soon</TCard.Badge>
                                    <TCard.Content>
                                        <TP>Tonomy DAO</TP>
                                    </TCard.Content>
                                </TCard>
                            </ScrollView>
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
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        width: '50%',
    },
    marginTop: {
        marginTop: 28,
    },
    cards: {
        flex: 1,
    },
    card: {
        marginRight: 16,
        marginVertical: 16,
    },
    scrollView: {
        marginRight: -20,
    },
});
