import { NavigationProp, useNavigation } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import {
    AuthenticationMessage,
    CommunicationError,
    LinkAuthRequestMessage,
    LoginRequestsMessage,
    objToBase64Url,
    parseDid,
    SdkError,
    SdkErrors,
} from '@tonomy/tonomy-id-sdk';
import { useCallback, useEffect, useState } from 'react';
import useErrorStore from '../store/errorStore';
import { RouteStackParamList } from '../navigation/Root';
import { scheduleNotificationAsync } from 'expo-notifications';
import { AppState } from 'react-native';
import { keyStorage } from '../utils/StorageManager/setup';
import {
    EthereumAccount,
    EthereumChain,
    EthereumPrivateKey,
    EthereumTransaction,
    WalletConnectSession,
} from '../utils/chain/etherum';
import { ChainType, ITransaction } from '../utils/chain/types';
import useWalletStore from '../store/useWalletStore';
import { getSdkError } from '@walletconnect/utils';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import Debug from 'debug';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '../utils/errors';
import { debounce, progressiveRetryOnNetworkError } from '../utils/network';
import {
    eip155StringToChainId,
    findEthereumTokenByChainId,
    getKeyFromChain,
    getKeyOrNullFromChain,
} from '../utils/tokenRegistry';

const debug = Debug('tonomy-id:services:CommunicationModule');

export default function CommunicationModule() {
    const { user, logout } = useUserStore();
    const navigation = useNavigation<NavigationProp<RouteStackParamList>>();
    const errorStore = useErrorStore();
    const [subscribers, setSubscribers] = useState<number[]>([]);
    const { accounts, initialized, web3wallet, disconnectSession, initializeWalletState } = useWalletStore();

    // initializeWalletState() on mount with progressiveRetryOnNetworkError()
    useEffect(() => {
        if (!initialized) {
            progressiveRetryOnNetworkError(initializeWalletState);
        }
    }, [initializeWalletState, initialized]);

    /**
     *  Login to communication microservice
     *  should be called on app start
     */
    async function loginToService() {
        try {
            const issuer = await user.getIssuer();
            const message = await AuthenticationMessage.signMessageWithoutRecipient({}, issuer);

            debug('loginToService() login message', message);

            const subscribers = listenToMessages();

            debug('loginToService() subscribers', subscribers);

            setSubscribers(subscribers);

            try {
                await user.loginCommunication(message);
            } catch (e) {
                if (e instanceof CommunicationError && (e.exception.status === 401 || e.exception.status === 404)) {
                    await logout(
                        e.exception.status === 401 ? 'Communication key rotation' : 'Communication key not found'
                    );
                } else {
                    throw e;
                }
            }
        } catch (e) {
            unsubscribeAll();

            if (isNetworkError(e)) {
                throw e;
            } else if (e instanceof SdkError && e.code === SdkErrors.CommunicationNotConnected) {
                throw new Error(NETWORK_ERROR_MESSAGE);
            } else {
                errorStore.setError({ error: e, expected: false });
            }
        }
    }

    function listenToMessages(): number[] {
        const loginRequestSubscriber = user.subscribeMessage(async (message) => {
            try {
                const senderDid = message.getSender();

                const { method, id } = parseDid(senderDid);

                // did:key is used for the initial login request so is allowed
                if (method !== 'key' && id !== parseDid(await user.getDid()).id) {
                    debug('LoginRequestsMessage sender did not match user did', senderDid, await user.getDid());
                    // Drop message. It came from a different account and we are not interested in it here.
                    // TODO: low priority: handle this case in a better way as it does present a DOS vector.
                    return;
                }

                await message.verify();

                const loginRequestsMessage = new LoginRequestsMessage(message);
                const payload = loginRequestsMessage.getPayload();
                const base64UrlPayload = objToBase64Url(payload);

                navigation.navigate('SSO', {
                    payload: base64UrlPayload,
                    platform: 'browser',
                });
                sendLoginNotificationOnBackground(payload.requests[0].getPayload().origin);
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            }
        }, LoginRequestsMessage.getType());

        const linkAuthRequestSubscriber = user.subscribeMessage(async (message) => {
            try {
                const senderDid = message.getSender().split('#')[0];

                if (senderDid !== (await user.getDid())) {
                    debug(
                        'linkAuthRequestSubscriber() LinkAuthRequestMessage sender did not match user did',
                        senderDid,
                        await user.getDid()
                    );
                    // Drop message. It came from a different account and we are not interested in it here.
                    // TODO: low priority: handle this case in a better way as it does present a DOS vector.
                    return;
                }

                await user.handleLinkAuthRequestMessage(message);
            } catch (e) {
                if (isNetworkError(e)) {
                    debug('linkAuthRequestSubscriber() Network error');
                } else if (e instanceof SdkError && e.code === SdkErrors.CommunicationNotConnected) {
                    debug('linkAuthRequestSubscriber() Network error connecting to Communication service');
                } else {
                    errorStore.setError({ error: e, expected: false });
                }
            }
        }, LinkAuthRequestMessage.getType());

        return [loginRequestSubscriber, linkAuthRequestSubscriber];
    }

    function sendLoginNotificationOnBackground(appName: string) {
        if (AppState.currentState === 'background') {
            scheduleNotificationAsync({
                content: {
                    title: `Login Request: ${appName}`,
                    body: `${appName} requesting your permission to login`,
                },
                trigger: null,
            });
        }
    }

    useEffect(() => {
        progressiveRetryOnNetworkError(loginToService);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, user]);

    const unsubscribeAll = useCallback(() => {
        for (const s of subscribers) {
            user.unsubscribeMessage(s);
        }
    }, [subscribers, user]);

    useEffect(() => {
        return () => {
            unsubscribeAll();
        };
    }, [subscribers, user, unsubscribeAll]);

    function sendWalletConnectNotificationOnBackground(title: string, body: string) {
        if (AppState.currentState === 'background') {
            scheduleNotificationAsync({
                content: {
                    title,
                    body,
                },
                trigger: null,
            });
        }
    }

    useEffect(() => {
        const handleSessionProposal = async (proposal: SignClientTypes.EventArguments['session_proposal']) => {
            try {
                if (web3wallet) {
                    const { id } = proposal;
                    const { requiredNamespaces, optionalNamespaces } = proposal.params;
                    const activeNamespaces = Object.keys(requiredNamespaces).length
                        ? requiredNamespaces
                        : optionalNamespaces;

                    const chainIds = activeNamespaces.eip155.chains?.map(eip155StringToChainId) || [];

                    // Step 1: find any of the chainIds that is not an Ethereum chain in the registry
                    const unsupportedChain = chainIds.find((chainId) => !findEthereumTokenByChainId(chainId));

                    if (unsupportedChain) {
                        errorStore.setError({
                            title: `Unsupported Chain ${unsupportedChain}`,
                            error: new Error(
                                'We currently support Ethereum Mainnet, Sepolia Testnet, and Polygon Mainnet.'
                            ),
                            expected: true,
                        });
                        await web3wallet?.rejectSession({
                            id: id,
                            reason: getSdkError('UNSUPPORTED_CHAINS'),
                        });
                        return;
                    }

                    // Step 2: Find the accounts for the session
                    const namespaces: SessionTypes.Namespaces = {};
                    const ethereumAccounts = accounts
                        .filter((account) => account !== null)
                        .filter(
                            (account) => account.getChain().getChainType() === ChainType.ETHEREUM
                        ) as EthereumAccount[];

                    Object.keys(activeNamespaces).forEach((key) => {
                        const accounts: string[] = [];

                        activeNamespaces[key].chains?.forEach((chain) => {
                            const chainId = chain.split(':')[1];

                            const ethereumAccount = ethereumAccounts.find(
                                (account) => account.getChain().getChainId() === chainId
                            );

                            if (!ethereumAccount) throw new Error(`Account not found for chainId ${chainId}`);
                            accounts.push(`${chain}:${ethereumAccount.getName()}`);
                        });
                        namespaces[key] = {
                            chains: activeNamespaces[key].chains,
                            accounts,
                            methods: activeNamespaces[key].methods,
                            events: activeNamespaces[key].events,
                        };
                    });
                    const session = new WalletConnectSession(web3wallet);

                    session.setNamespaces(namespaces);
                    session.setActiveAccounts(ethereumAccounts);

                    // Step 3: Check for any missing keys
                    for (const chainId of chainIds) {
                        const chainEntry = findEthereumTokenByChainId(chainId);

                        if (chainEntry) {
                            const key = await getKeyOrNullFromChain(chainEntry);

                            if (!key) {
                                navigation.navigate('CreateEthereumKey', {
                                    requestType: 'loginRequest',
                                    payload: proposal,
                                    session,
                                });
                                return;
                            }
                        }
                    }

                    navigation.navigate('WalletConnectLogin', {
                        payload: proposal,
                        platform: 'browser',
                        session,
                    });
                }
            } catch (error) {
                console.error('handleSessionProposal()', error);
            }
        };

        const handleSessionRequest = async (event: SignClientTypes.EventArguments['session_request']) => {
            try {
                if (web3wallet) {
                    const { topic, params, id, verifyContext } = event;
                    const { request, chainId } = params;
                    const session = new WalletConnectSession(web3wallet);

                    switch (request.method) {
                        case 'eth_sendTransaction': {
                            const transactionData = request.params[0];

                            const chainEntry = findEthereumTokenByChainId(eip155StringToChainId(chainId));

                            if (!chainEntry) throw new Error('Chain not found');
                            const ethereumPrivateKey = (await getKeyFromChain(chainEntry)) as EthereumPrivateKey;

                            let transaction: ITransaction;

                            if (ethereumPrivateKey) {
                                transaction = await EthereumTransaction.fromTransaction(
                                    ethereumPrivateKey,
                                    transactionData,
                                    chainEntry.chain as EthereumChain
                                );
                                navigation.navigate('SignTransaction', {
                                    transaction,
                                    privateKey: ethereumPrivateKey,
                                    origin: verifyContext?.verified?.origin,
                                    request: event,
                                    session,
                                });
                            } else {
                                transaction = new EthereumTransaction(
                                    transactionData,
                                    chainEntry.chain as EthereumChain
                                );
                                navigation.navigate('CreateEthereumKey', {
                                    requestType: 'transactionRequest',
                                    payload: event,
                                    transaction: transaction,
                                    session,
                                });
                            }

                            sendWalletConnectNotificationOnBackground(
                                'Transaction Request',
                                'Ethereum transaction signing request'
                            );
                            break;
                        }

                        default: {
                            const response = {
                                id: id,
                                error: getSdkError('UNSUPPORTED_METHODS'),
                                jsonrpc: '2.0',
                            };

                            await web3wallet?.respondSessionRequest({
                                topic,
                                response,
                            });
                            return;
                        }
                    }
                }
            } catch (error) {
                errorStore.setError({ error, expected: false });
            }
        };

        web3wallet?.on('session_proposal', handleSessionProposal);
        web3wallet?.on('session_request', handleSessionRequest);

        // Cleanup function
        return () => {
            if (web3wallet) {
                web3wallet.off('session_proposal', handleSessionProposal);
                web3wallet.off('session_request', handleSessionRequest);
            }
        };
    }, [web3wallet, initialized, errorStore, navigation, accounts]);

    useEffect(() => {
        const handleSessionDelete = debounce(async (event) => {
            try {
                if (event.topic) {
                    const sessions = await web3wallet?.getActiveSessions();
                    const sessionExists =
                        Array.isArray(sessions) && sessions.some((session) => session.topic === event.topic);

                    if (sessionExists) {
                        await web3wallet?.disconnectSession({
                            topic: event.topic,
                            reason: getSdkError('INVALID_SESSION_SETTLE_REQUEST'),
                        });
                        disconnectSession();
                    } else {
                        debug('Session already deleted or invalid');
                    }
                }
            } catch (disconnectError) {
                debug('Failed to disconnect session:', disconnectError);
            }
        }, 1000);

        web3wallet?.on('session_delete', handleSessionDelete);

        return () => {
            web3wallet?.off('session_delete', handleSessionDelete);
        };
    }, [web3wallet, disconnectSession, navigation, errorStore]);

    return null;
}
