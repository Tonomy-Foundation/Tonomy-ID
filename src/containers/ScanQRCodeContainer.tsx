import { BarCodeScannerResult } from 'expo-barcode-scanner';
import { CommunicationError, IdentifyMessage, SdkError, SdkErrors, validateQrCode } from '@tonomy/tonomy-id-sdk';
import useUserStore from '../store/userStore';
import useWalletStore from '../store/useWalletStore';
import settings from '../settings';
import Debug from 'debug';
import useErrorStore from '../store/errorStore';
import { ScanQRScreenProps } from '../screens/ScanQRScreen';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Images } from '../assets';
import QRCodeScanner from '../components/QRCodeScanner';
import theme from '../utils/theme';
import { isNetworkError, NETWORK_ERROR_RESPONSE } from '../utils/errors';
import { AbiProvider, SigningRequest, SigningRequestEncodingOptions } from '@wharfkit/signing-request';
import ABICache from '@wharfkit/abicache';
import { APIClient, PrivateKey } from '@wharfkit/antelope';
import zlib from 'pako';
import {
    AntelopeAccount,
    AntelopeChain,
    AntelopePrivateKey,
    AntelopeSigningRequestSession,
    AntelopeTransaction,
    getChainFromAntelopeChainId,
} from '../utils/chain/antelope';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import TSpinner from '../components/atoms/TSpinner';

const debug = Debug('tonomy-id:containers:ScanQRCodeContainer');

export type ScanQRContainerProps = {
    did;
    navigation: ScanQRScreenProps['navigation'];
};
export default function ScanQRCodeContainer({
    did,
    navigation,
}: {
    did?: string;
    navigation: ScanQRContainerProps['navigation'];
}) {
    const userStore = useUserStore();
    const user = userStore.user;
    const errorStore = useErrorStore();
    const [accountName, setAccountName] = useState('');
    const [isLoadingView, setIsLoadingView] = useState(false);

    const { web3wallet } = useWalletStore();

    const setUserName = useCallback(async () => {
        try {
            const accountName = (await user.getAccountName()).toString();

            setAccountName(accountName);
        } catch (e) {
            if (isNetworkError(e)) {
                debug('setUserName() network error');
            } else errorStore.setError({ error: e, expected: false });
        }
    }, [user, errorStore]);

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
            }
        },
        [errorStore, connectToDid]
    );

    // setUserName() on mount
    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, [setUserName, did, onUrlOpen]);

    async function onScan({ data }: BarCodeScannerResult) {
        debug('onScan() data:', data);
        setIsLoadingView(true);

        try {
            if (data.startsWith('wc:')) {
                if (web3wallet) await web3wallet.core.pairing.pair({ uri: data });
            } else if (data.startsWith('esr:')) {
                const signingRequestBasic = SigningRequest.from(data, { zlib });

                const chain: AntelopeChain = getChainFromAntelopeChainId(signingRequestBasic.getChainId().toString());

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

                const account = AntelopeAccount.fromAccount(chain, (await user.getAccountName()).toString());
                const transaction = AntelopeTransaction.fromActions(actions, chain, account);
                const antelopeKey = new AntelopePrivateKey(PrivateKey.from(privateKey), chain);
                const session = new AntelopeSigningRequestSession(antelopeKey, chain);

                const callback = resolvedSigningRequest.request.data.callback;
                const origin = new URL(callback).origin;

                debug('onScan() transaction:', transaction.getChain().getChainType());

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
                errorStore.setError({ error: e, expected: false });
            }
        } finally {
            setTimeout(() => {
                setIsLoadingView(false);
            }, 8000);
        }
    }

    return (
        <View style={styles.content}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.QRContainer}>
                    {isLoadingView ? <TSpinner /> : <QRCodeScanner onScan={onScan} />}
                </View>
                <View style={styles.bottomInstruction}>
                    <Text style={{ fontWeight: '500' }}>QR scanner can be used for:</Text>
                    <View style={styles.flexCol}>
                        <View style={styles.flexRow}>
                            <Image source={Images.GetImage('logo48')} style={styles.favicon} />
                            <Text>Login to Web4 (Pangea) apps</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/crypto-transaction.png')} style={styles.favicon} />
                            <Text>Crypto transactions</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: 16,
    },

    scrollViewContent: {
        flexGrow: 1,
    },
    bottomInstruction: {
        marginTop: 15,
        padding: 15,
        marginBottom: 40,
        backgroundColor: theme.colors.grey7,
        borderRadius: 16,
    },
    favicon: {
        width: 16,
        height: 16,
    },
    flexCol: {
        flexDirection: 'column',
        gap: 10,
        marginTop: 10,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    QRContainer: {
        flex: 1,
        borderRadius: 25,
        position: 'relative',
        overflow: 'hidden',
    },
});
