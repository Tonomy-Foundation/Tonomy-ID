import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Keyboard } from 'react-native';
import { TButtonContained } from '../components/atoms/TButton';
import { TH1 } from '../components/atoms/THeadings';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/CreateEthereumKeyScreen';
import useUserStore from '../store/userStore';
import { AccountType, SdkError, SdkErrors, TonomyUsername, TonomyContract, util } from '@tonomy/tonomy-id-sdk';
import { generatePrivateKeyFromPassword, savePrivateKeyToStorage } from '../utils/keys';
import useErrorStore from '../store/errorStore';
import { DEFAULT_DEV_PASSPHRASE_LIST } from '../store/passphraseStore';
import PassphraseInput from '../components/PassphraseInput';
import useWalletStore from '../store/useWalletStore';
import { WalletConnectSession } from '../utils/chain/etherum';
import { Web3WalletTypes } from '@walletconnect/web3wallet';
import { SignClientTypes } from '@walletconnect/types';
import Debug from 'debug';
import { createNetworkErrorState, isNetworkError } from '../utils/errors';
import { addNativeTokenToAssetStorage } from './LoginPassphraseContainer';
import { getKeyFromChain } from '../utils/tokenRegistry';
import { findEthereumTokenByChainId } from '../services/CommunicationModule';

const debug = Debug('tonomy-id:containers:CreateEthereunKey');

const tonomyContract = TonomyContract.Instance;

export default function CreateEthereumKeyContainer({
    route,
    navigation,
}: {
    route: Props['route'];
    navigation: Props['navigation'];
}) {
    const errorsStore = useErrorStore();
    const { user } = useUserStore();
    const transaction = route.params?.transaction;

    const { web3wallet } = useWalletStore();
    const [passphrase, setPassphrase] = useState<string[]>(
        settings.isProduction() ? ['', '', '', '', '', ''] : DEFAULT_DEV_PASSPHRASE_LIST
    );
    const [nextDisabled, setNextDisabled] = useState(settings.isProduction() ? true : false);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const { verifyContext } = route.params?.payload as Web3WalletTypes.SessionRequest;

    async function setUserName() {
        try {
            const u = await user.getUsername();

            setUsername(u.getBaseUsername());
        } catch (e) {
            errorsStore.setError({ error: e, expected: false });
        }
    }

    useEffect(() => {
        setUserName();
    }, []);

    useEffect(() => {
        const isValid = passphrase.every(util.isKeyword);

        setNextDisabled(!isValid);
    }, [passphrase]);

    async function onNext() {
        setLoading(true);

        try {
            const tonomyUsername = TonomyUsername.fromUsername(
                username,
                AccountType.PERSON,
                settings.config.accountSuffix
            );

            const idData = await tonomyContract.getPerson(tonomyUsername);
            const salt = idData.password_salt;

            await user.login(tonomyUsername, passphrase.join(' '), {
                keyFromPasswordFn: generatePrivateKeyFromPassword,
            });

            await savePrivateKeyToStorage(passphrase.join(' '), salt.toString());
            await addNativeTokenToAssetStorage(user);

            setPassphrase(['', '', '', '', '', '']);
            setNextDisabled(false);
            setLoading(false);

            redirectFunc();
        } catch (e) {
            debug('onNext() function error', e);

            if (isNetworkError(e)) {
                errorsStore.setError(createNetworkErrorState());
            } else if (e instanceof SdkError) {
                switch (e.code) {
                    case SdkErrors.PasswordInvalid:
                    case SdkErrors.PasswordFormatInvalid:
                    case SdkErrors.AccountDoesntExist:
                        errorsStore.setError({
                            error: new Error('Incorrect passphrase. Please try again.'),
                            expected: true,
                        });
                        break;
                    default:
                        errorsStore.setError({ error: e, expected: false });
                }
            } else {
                errorsStore.setError({ error: e, expected: false });
            }

            setNextDisabled(false);
            setLoading(false);
        }
    }

    const redirectFunc = async () => {
        const requestType = route.params?.requestType;

        if (web3wallet) {
            const walletsession = new WalletConnectSession(web3wallet);

            if (requestType === 'loginRequest' && route.params?.payload) {
                navigation.navigate('WalletConnectLogin', {
                    payload: route.params.payload as SignClientTypes.EventArguments['session_proposal'],
                    platform: 'browser',
                    session: walletsession,
                });
            } else if (requestType === 'transactionRequest') {
                if (transaction) {
                    const chainId = transaction?.getChain().getChainId();
                    const chainEntry = findEthereumTokenByChainId(chainId);

                    if (!chainEntry) throw new Error('Chain not found');
                    const privateKey = await getKeyFromChain(chainEntry);

                    navigation.navigate('SignTransaction', {
                        transaction,
                        privateKey,
                        request: route.params.payload as Web3WalletTypes.SessionRequest,
                        session: walletsession,
                        origin: verifyContext?.verified?.origin,
                    });
                } else {
                    navigation.navigate('Assets');
                }
            } else {
                navigation.navigate('Assets');
            }
        } else {
            errorsStore.setError({
                error: new Error('Wallet not found'),
                title: 'Wallet initialzed error',
                expected: true,
            });
        }
    };

    // Inside your component
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Enter your passphrase</TH1>
                        <Text style={styles.subHeading}>
                            We use your passphrase to generate a highly secure private key that’s gonna be used across
                            the devices
                        </Text>
                        <View style={styles.innerContainer}>
                            <PassphraseInput
                                value={passphrase}
                                onChange={setPassphrase}
                                setNextDisabled={setNextDisabled}
                            />
                        </View>
                    </View>
                }
                footerHint={
                    <View>
                        <TInfoBox
                            align="left"
                            icon="security"
                            description="Your password and private keys are self-sovereign meaning hackers have a very very hard time!"
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>
                }
                footer={
                    !isKeyboardVisible ? (
                        <View style={styles.createAccountMargin}>
                            <View style={commonStyles.marginBottom}>
                                <TButtonContained onPress={onNext} disabled={nextDisabled || loading}>
                                    PROCEED
                                </TButtonContained>
                            </View>
                        </View>
                    ) : undefined
                }
            />
        </>
    );
}

const styles = StyleSheet.create({
    subHeading: {
        textAlign: 'center',
        paddingHorizontal: 15,
        color: theme.colors.grey1,
        marginBottom: 20,
    },
    headline: {
        marginTop: 10,
        fontSize: 20,
        marginBottom: 5,
    },
    innerContainer: {
        marginTop: 10,
        justifyContent: 'center',
    },
    createAccountMargin: {
        marginTop: 18,
    },
});
