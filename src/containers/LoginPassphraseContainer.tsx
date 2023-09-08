import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/LoginPassphraseScreen';
import PassphraseBox from '../components/PassphraseBox';
import useUserStore, { UserStatus } from '../store/userStore';
import { AccountType, SdkError, SdkErrors, TonomyUsername } from '@tonomy/tonomy-id-sdk';
import { generatePrivateKeyFromPassword } from '../utils/keys';
import useErrorStore from '../store/errorStore';
import { DEFAULT_DEV_PASSPHRASE_LIST } from '../store/passphraseStore';

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
    const [nextDisabled, setNextDisabled] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const hasEffectRun = useRef(false);

    useEffect(() => {
        if (!hasEffectRun.current) {
            setPassphrase(user.generateRandomPassphrase());
            hasEffectRun.current = true;
        }
    }, [user]);

    async function updateKeys() {
        await user.updateKeys(passphrase.join(' '));
        setStatus(UserStatus.LOGGED_IN);
    }

    async function onNext() {
        setLoading(true);

        try {
            const result = await user.login(
                TonomyUsername.fromUsername(username, AccountType.PERSON, settings.config.accountSuffix),
                passphrase.join(' '),
                { keyFromPasswordFn: generatePrivateKeyFromPassword }
            );

            if (result?.account_name !== undefined) {
                setPassphrase(['', '', '', '', '', '']);
                setErrorMessage('');
                await user.saveLocal();
                await updateKeys();
            }
        } catch (e) {
            if (e instanceof SdkError) {
                switch (e.code) {
                    case SdkErrors.UsernameNotFound:
                    case SdkErrors.PasswordInvalid:
                    case SdkErrors.PasswordFormatInvalid:
                    case SdkErrors.AccountDoesntExist:
                        setErrorMessage('The passphrase you have entered is incorrect.<br /> Please try again.');
                        break;
                    default:
                        setErrorMessage('');
                        errorsStore.setError({ error: e, expected: false });
                }

                setLoading(false);
                return;
            } else {
                errorsStore.setError({ error: e, expected: false });
                setLoading(false);
                return;
            }
        }
    }

    async function onChangeWord(index: number, word: string) {
        setErrorMessage('');

        // cif words are valid
        setNextDisabled(false);
        // if words are not valid
        setNextDisabled(true);
        setErrorMessage('Word is not part of the combination list');
    }

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Passphrase</TH1>
                        <View style={styles.innerContainer}>
                            <View style={styles.columnContainer}>
                                {passphrase.map((text, index) => (
                                    // TODO change to autosuggest
                                    <PassphraseBox number={`${index + 1}.`} text={text} key={index} />
                                ))}
                            </View>
                        </View>
                        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                    </View>
                }
                footerHint={
                    <View>
                        <TInfoBox
                            align="left"
                            icon="security"
                            description="Your passphrase and private keys are self-sovereign meaning hackers have a very  hard time! "
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>
                }
                footer={
                    <View style={styles.createAccountMargin}>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained onPress={onNext} disabled={nextDisabled || loading}>
                                NEXT
                            </TButtonContained>
                        </View>
                        <View style={styles.textContainer}>
                            <TP size={1}>Don&apost have an account?</TP>
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
        color: theme.colors.error,
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
    regenerateBtn: {
        width: '50%',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});
