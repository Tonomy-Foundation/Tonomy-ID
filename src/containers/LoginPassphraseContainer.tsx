import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { TButtonContained } from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/LoginPassphraseScreen';
import useUserStore, { UserStatus } from '../store/userStore';
import { AccountType, isErrorCode, SdkErrors, TonomyUsername, TonomyContract } from '@tonomy/tonomy-id-sdk';
import { generatePrivateKeyFromPassword, savePrivateKeyToStorage } from '../utils/keys';
import useErrorStore from '../store/errorStore';
import { DEFAULT_DEV_PASSPHRASE_LIST } from '../store/passphraseStore';
import PassphraseInput from '../components/PassphraseInput';
import { createNetworkErrorState, isNetworkError } from '../utils/errors';
import { setUser } from '../utils/sentry';
import TInfoModalBox from '../components/TInfoModalBox';

const tonomyContract = TonomyContract.Instance;

export default function LoginPassphraseContainer({
    navigation,
    username,
}: {
    navigation: Props['navigation'];
    username: string;
}) {
    const errorsStore = useErrorStore();
    const { user, setStatus } = useUserStore();

    const [passphrase, setPassphrase] = useState<string[]>(
        settings.isProduction() ? ['', '', '', '', '', ''] : DEFAULT_DEV_PASSPHRASE_LIST
    );
    const [nextDisabled, setNextDisabled] = useState(settings.isProduction() ? true : false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function updateKeys() {
        await user.updateKeys(passphrase.join(' '));
    }

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

            await savePrivateKeyToStorage(passphrase.join(' '), salt.toString());

            const result = await user.login(tonomyUsername, passphrase.join(' '), {
                keyFromPasswordFn: generatePrivateKeyFromPassword,
            });

            if (result?.account_name !== undefined) {
                setUser({
                    id: result.account_name.toString(),
                    username: '@' + tonomyUsername.getBaseUsername(),
                });
                setPassphrase(['', '', '', '', '', '']);
                setNextDisabled(false);
                setErrorMessage('');
                await user.saveLocal();
                await updateKeys();
                setStatus(UserStatus.LOGGED_IN);
            } else {
                throw new Error('Account name not found');
            }
        } catch (e) {
            if (isNetworkError(e)) {
                errorsStore.setError(createNetworkErrorState());
            } else if (
                isErrorCode(e, [
                    SdkErrors.UsernameNotFound,
                    SdkErrors.PasswordInvalid,
                    SdkErrors.PasswordFormatInvalid,
                    SdkErrors.AccountDoesntExist,
                ])
            ) {
                setErrorMessage('Incorrect passphrase. Please try again.');
                return;
            } else {
                setErrorMessage('');
                errorsStore.setError({ error: e, expected: false });

                return;
            }
        } finally {
            setNextDisabled(true);
            setLoading(false);
        }
    }

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Passphrase</TH1>
                        <View style={styles.innerContainer}>
                            <PassphraseInput
                                value={passphrase}
                                onChange={setPassphrase}
                                setNextDisabled={setNextDisabled}
                                disabled={loading}
                            />
                        </View>
                        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                    </View>
                }
                footerHint={
                    <View>
                        <TInfoModalBox
                            description="Your account is protected with end-to-end cryptography"
                            modalTitle="Full Key Ownership"
                            modalDescription="Your account is protected with end-to-end cryptography, meaning no one — not even us — can access your private information. You have full, sovereign control over your keys and identity. Only you can unlock and manage your account"
                        />
                    </View>
                }
                footer={
                    <View style={styles.createAccountMargin}>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained
                                loading={loading || nextDisabled}
                                disabled={loading}
                                style={{ width: '100%' }}
                                size="large"
                                onPress={onNext}
                            >
                                NEXT
                            </TButtonContained>
                        </View>
                        <View style={styles.textContainer}>
                            <TP size={1}>Don&apos;t have an account?</TP>
                            <TouchableOpacity onPress={() => navigation.navigate('CreateAccountUsername')}>
                                <TP size={1} style={styles.link}>
                                    Sign Up
                                </TP>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}

const styles = StyleSheet.create({
    errorText: {
        ...commonStyles.textAlignCenter,
        color: theme.colors.error,
    },
    menuViewTop: {
        bottom: 47,
    },
    menuViewBottom: {
        top: 47,
    },
    autoCompleteViewContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginRight: 15,
        marginBottom: 10,
        // position: 'relative',
    },
    autoCompleteContainer: {
        width: 120,
        marginTop: 22,
        justifyContent: 'flex-start',
        position: 'relative',
    },
    autoCompleteNumber: {
        marginRight: -15,
        marginLeft: 10,
        zIndex: -1,
    },
    autoCompleteTextInput: {
        width: 120,
        height: 42,
        marginTop: 22,
        justifyContent: 'center',
    },
    headline: {
        marginTop: -10,
        fontSize: 20,
        marginBottom: 5,
    },
    paragraph: {
        textAlign: 'center',
        fontSize: 14,
    },
    innerContainer: {
        marginTop: 20,
        justifyContent: 'center',
    },
    createAccountMargin: {
        marginTop: 18,
    },
    link: {
        color: theme.colors.primary,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    columnContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    btnView: {
        textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
});
