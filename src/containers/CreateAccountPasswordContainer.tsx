import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import TPasswordInput from '../components/molecules/TPasswordInput';
import TLink from '../components/atoms/TA';
import { TCaption, TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore, { UserStatus } from '../store/userStore';
import { SdkError, SdkErrors, TonomyUsername, AccountType } from '@tonomy/tonomy-id-sdk';
import theme, { commonStyles } from '../utils/theme';
import TModal from '../components/TModal';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import useErrorStore from '../store/errorStore';
import TErrorModal from '../components/TErrorModal';
import { Props } from '../screens/CreateAccountPasswordScreen';
import TA from '../components/atoms/TA';
import { generatePrivateKeyFromPassword } from '../utils/keys';

export default function CreateAccountPasswordContainer({ navigation }: Props) {
    const [password, setPassword] = useState(!settings.isProduction() ? 'k^3dTEqXfolCPo5^QhmD' : '');
    const [password2, setPassword2] = useState(!settings.isProduction() ? 'k^3dTEqXfolCPo5^QhmD' : '');
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmErrorMessage, setConfirmErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [trxUrl, setTrxUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showUsernameErrorModal, setShowUsernameErrorModal] = useState(false);
    const userStore = useUserStore();
    const user = userStore.user;

    const errorStore = useErrorStore();
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (password.length > 0) {
            setErrorMessage('');
        }

        if (password !== password2 && password2.length > 0) {
            setConfirmErrorMessage('Passwords do not match');
        } else {
            setConfirmErrorMessage('');
        }
    }, [password, password2]);

    async function onNext() {
        if (password !== password2) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await user.savePassword(password, { keyFromPasswordFn: generatePrivateKeyFromPassword });
            const res = await user.createPerson();

            await user.saveLocal();
            await updateKeys();
            // this only works when blockchainUrl === http://localhost || https:// but not with http://ip-address
            setTrxUrl(
                `https://local.bloks.io/transaction/${res.processed.id}?nodeUrl=${settings.config.blockchainUrl}&coreSymbol=SYS&systemDomain=eosio`
            );
        } catch (e: any) {
            if (e instanceof SdkError) {
                switch (e.code) {
                    case SdkErrors.UsernameTaken:
                        setShowUsernameErrorModal(true);
                        break;
                    case SdkErrors.PasswordFormatInvalid:
                        setErrorMessage(
                            'Password must be 12 characters with upper and lowercase letters and one number'
                        );
                        break;
                    case SdkErrors.PasswordTooCommon:
                        setErrorMessage('Password contains words or phrases that are common in passwords.');
                        break;
                    default:
                        errorStore.setError({ error: e, expected: false });
                }

                setLoading(false);
                return;
            } else {
                errorStore.setError({ error: e, expected: false });
                setLoading(false);
                return;
            }
        }

        setLoading(false);

        setShowModal(true);
    }

    async function setUserName() {
        try {
            const username = await user.getUsername();

            setUsername(username.getBaseUsername());
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    useEffect(() => {
        setUserName();
    }, []);

    async function onModalPress() {
        setShowModal(false);
    }

    async function updateKeys() {
        await user.updateKeys(password);
        userStore.setStatus(UserStatus.LOGGED_IN);
    }

    async function onUsernameErrorModalPress() {
        setShowUsernameErrorModal(false);
        navigation.navigate('CreateAccountUsername');
    }

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Create password</TH1>
                        <View style={styles.innerContainer}>
                            <View>
                                <TP
                                    size={1}
                                    style={errorMessage.length > 0 ? errorStyles.labelError : styles.labelText}
                                >
                                    Password
                                </TP>
                                <TPasswordInput
                                    value={password}
                                    onChangeText={setPassword}
                                    errorText={errorMessage}
                                    outlineColor={errorMessage.length > 0 ? theme.colors.error : theme.colors.primary}
                                    style={commonStyles.marginBottom}
                                />
                            </View>
                            <View>
                                <TP style={confirmErrorMessage.length > 0 ? errorStyles.labelError : styles.labelText}>
                                    Confirm Password
                                </TP>
                                <TPasswordInput
                                    value={password2}
                                    onChangeText={setPassword2}
                                    errorText={confirmErrorMessage}
                                    outlineColor={
                                        confirmErrorMessage.length > 0 ? theme.colors.error : theme.colors.primary
                                    }
                                    style={commonStyles.marginBottom}
                                />
                            </View>
                            <View style={[commonStyles.marginBottom, commonStyles.alignItemsCenter]}>
                                <TP size={1} style={[styles.rememberPasswordText, styles.passwordText]}>
                                    Remember your password for future use
                                </TP>
                            </View>
                        </View>
                    </View>
                }
                footerHint={
                    <View>
                        <View>
                            <TP size={1} style={commonStyles.textAlignCenter}>
                                By continuing, you agree to our
                                <TA href={settings.config.links.termsAndConditions}> Terms & Conditions </TA>
                                and agree tonomy
                                <TA href={settings.config.links.privacyPolicy}> Privacy Policy </TA>
                            </TP>
                        </View>

                        <TInfoBox
                            align="left"
                            icon="security"
                            description="Your password is never sent or stored or seen except on your phone. Nobody, not even Tonomy Foundation, can pretend to be you."
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>
                }
                footer={
                    <View style={styles.createAccountMargin}>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained
                                onPress={onNext}
                                disabled={
                                    password.length === 0 || password2.length === 0 || password2 !== password || loading
                                }
                                loading={loading}
                            >
                                CREATE ACCOUNT
                            </TButtonContained>
                        </View>
                        <View style={styles.textContainer}>
                            <TP size={1}>Already have an account? </TP>
                            <TouchableOpacity onPress={() => navigation.navigate('LoginUsername')}>
                                <TP size={1} style={styles.link}>
                                    Login
                                </TP>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            ></LayoutComponent>
            <TErrorModal
                visible={showUsernameErrorModal}
                onPress={onUsernameErrorModalPress}
                title="Please choose another username"
                expected={true}
                icon={''}
            >
                <View>
                    <Text>
                        Username <Text style={{ color: theme.colors.primary }}>{username}</Text> is already taken.
                        Please choose another one.
                    </Text>
                </View>
            </TErrorModal>
            <TModal
                visible={showModal}
                onPress={onModalPress}
                icon="check"
                title={'Welcome to ' + settings.config.ecosystemName}
            >
                <View>
                    <Text>
                        Your username is <Text style={{ color: theme.colors.primary }}>{username}</Text>
                    </Text>
                </View>
                <View style={errorModalStyles.marginTop}>
                    <Text>
                        See it on the blockchain <TLink href={trxUrl}>here</TLink>
                    </Text>
                </View>
            </TModal>
        </>
    );
}

const errorModalStyles = StyleSheet.create({
    marginTop: {
        marginTop: 6,
    },
});

const styles = StyleSheet.create({
    footerText: {
        flex: 1,
    },
    createAccountMargin: {
        marginTop: 35,
    },
    rememberPasswordText: {
        color: theme.colors.error,
    },
    headline: {
        marginTop: 20,
        fontSize: 24,
    },
    passwordText: {
        alignSelf: 'flex-end',
    },
    labelText: {
        color: theme.colors.primary,
    },
    link: {
        color: theme.colors.primary,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    innerContainer: {
        height: '90%',
        justifyContent: 'center',
    },
});

const errorStyles = StyleSheet.create({
    labelError: {
        color: theme.colors.error,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
});
