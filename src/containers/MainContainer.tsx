import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Image, ScrollView, Text } from 'react-native';
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
import { SignClientTypes, SessionTypes } from '@walletconnect/types';
import TModal from '../components/TModal';
import { currentETHAddress, web3wallet, _pair } from '../utils/Web3WalletClient';
import { useNavigation } from '@react-navigation/native';
import { EIP155_SIGNING_METHODS } from '../data/EIP155';

export default function MainContainer({ did }: { did?: string }) {
    const userStore = useUserStore();
    const user = userStore.user;
    const [username, setUsername] = useState('');
    const [qrOpened, setQrOpened] = useState<boolean>(false);
    const [isLoadingView, setIsLoadingView] = useState(false);
    const errorStore = useErrorStore();
    const [approvalModal, setApprovalModal] = useState(false);
    const [pairedProposal, setPairedProposal] = useState({});
    const [requestSession, setRequestSession] = useState({});
    const [requestEventData, setRequestEventData] = useState({});
    const [transactionModal, setTransactionModal] = useState(false);

    const navigation = useNavigation();

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
            if (data.startsWith('wc:')) {
                console.log('if');
                await pair(data);
            } else {
                console.log('else');

                const did = validateQrCode(data);

                await connectToDid(did);
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

    async function pair(WCURI: string) {
        console.log('WCURI', WCURI);
        const pairing = await _pair({ uri: WCURI });

        setApprovalModal(true);

        console.log('pairing', pairing);
        return pairing;
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

    const onSessionProposal = useCallback((proposal: SignClientTypes.EventArguments['session_proposal']) => {
        setPairedProposal(proposal);
    }, []);

    const onSessionRequest = useCallback(async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        const { topic, params } = requestEvent;
        const { request } = params;
        const requestSessionData = web3wallet.engine.signClient.session.get(topic);

        console.log('request', request.method);

        switch (request.method) {
            case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
                return;
            case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
                setRequestSession(requestSessionData);
                setRequestEventData(requestEvent);
                setTransactionModal(true);
                return;
        }
    }, []);

    useEffect(() => {
        if (approvalModal || transactionModal) {
            web3wallet.on('session_proposal', onSessionProposal);
            web3wallet.on('session_request', onSessionRequest);
        }
    }, [approvalModal, onSessionProposal, onSessionRequest, requestSession, transactionModal]);

    function onClose() {
        setQrOpened(false);
    }

    const handleRedirect = async () => {
        console.log('redirect', requestEventData, requestSession);
        navigation.navigate('SignTransaction', {
            requestSession: requestSession,
            requestEvent: requestEventData,
        });
    };

    async function handleAccept() {
        const { id, params } = pairedProposal;
        const { requiredNamespaces, relays } = params;

        if (pairedProposal) {
            const namespaces: SessionTypes.Namespaces = {};

            console.log('namespaces', namespaces);
            Object.keys(requiredNamespaces).forEach((key) => {
                const accounts: string[] = [];

                requiredNamespaces[key].chains.map((chain) => {
                    [currentETHAddress].map((acc) => accounts.push(`${chain}:${acc}`));
                });
                console.log('accounts', accounts);

                namespaces[key] = {
                    // accounts,
                    accounts: ['eip155:11155111:0x253c8d99c27d47A4DcdB04B40115AB1dAc466280'],
                    methods: requiredNamespaces[key].methods,
                    events: requiredNamespaces[key].events,
                };
            });
            await web3wallet.approveSession({
                id,
                relayProtocol: relays[0].protocol,
                namespaces,
            });
            setApprovalModal(false);
        }
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
            <TModal
                visible={approvalModal}
                icon="check"
                onPress={() => setApprovalModal(false)}
                title={'Welcome to ' + settings.config.appName}
            >
                <View>
                    <Text>You are getting login request from wallet connect</Text>
                    <TButtonContained
                        onPress={() => {
                            handleAccept();
                        }}
                    >
                        Accept
                    </TButtonContained>
                </View>
            </TModal>
            <TModal
                visible={transactionModal}
                icon="check"
                onPress={() => setTransactionModal(false)}
                title={'Welcome to ' + settings.config.appName}
            >
                <View>
                    <Text>Do you want to proceed with the eth transaction?</Text>
                    <TButtonContained
                        onPress={() => {
                            handleRedirect();
                        }}
                    >
                        Accept
                    </TButtonContained>
                </View>
            </TModal>
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
