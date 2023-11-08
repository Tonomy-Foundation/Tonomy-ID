import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { TButtonContained } from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/LoginPassphraseScreen';
import useUserStore, { UserStatus } from '../store/userStore';
import { AccountType, SdkError, SdkErrors, TonomyUsername, util } from '@tonomy/tonomy-id-sdk';
import { generatePrivateKeyFromPassword } from '../utils/keys';
import useErrorStore from '../store/errorStore';
import { DEFAULT_DEV_PASSPHRASE_LIST } from '../store/passphraseStore';
import AutoCompletePassphraseWord from '../components/AutoCompletePassphraseWord';

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
            const result = await user.login(
                TonomyUsername.fromUsername(username, AccountType.PERSON, settings.config.accountSuffix),
                passphrase.join(' '),
                { keyFromPasswordFn: generatePrivateKeyFromPassword }
            );

            if (result?.account_name !== undefined) {
                setPassphrase(['', '', '', '', '', '']);
                setNextDisabled(false);
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
                        setErrorMessage('Incorrect passphrase. Please try again.');
                        break;
                    default:
                        setErrorMessage('');
                        errorsStore.setError({ error: e, expected: false });
                }

                setNextDisabled(true);
                setLoading(false);
                return;
            } else {
                errorsStore.setError({ error: e, expected: false });
                setNextDisabled(true);
                setLoading(false);
                return;
            }
        }
    }

    async function onChangeWord(index: number, word: string) {
        setErrorMessage('');

        setPassphrase((prev) => {
            const newPassphrase = [...prev];

            newPassphrase[index] = word;
            setNextDisabled(false);

            for (let i = 0; i < newPassphrase.length; i++) {
                if (!util.isKeyword(newPassphrase[i])) {
                    setNextDisabled(true);
                }
            }

            return newPassphrase;
        });
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
                                    <View key={index} style={styles.autoCompleteViewContainer}>
                                        <Text style={styles.autoCompleteNumber}>{index + 1}.</Text>
                                        <AutoCompletePassphraseWord
                                            textInputStyle={styles.autoCompleteTextInput}
                                            containerStyle={styles.autoCompleteContainer}
                                            value={text}
                                            onChange={(text) => onChangeWord(index, text)}
                                            menuStyle={index < 2 ? styles.menuViewBottom : styles.menuViewTop}
                                        />
                                    </View>
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
    regenerateBtn: {
        width: '50%',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});
