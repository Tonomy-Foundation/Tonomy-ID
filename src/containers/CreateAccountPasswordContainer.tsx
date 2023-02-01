import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import TPasswordInput from '../components/molecules/TPasswordInput';
import TLink from '../components/atoms/TA';
import { TCaption, TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { SdkError, SdkErrors } from 'tonomy-id-sdk';
import theme, { commonStyles } from '../utils/theme';
import TModal from '../components/TModal';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import useErrorStore from '../store/errorStore';
import TErrorModal from '../components/TErrorModal';
import { Props } from '../screens/CreateAccountPasswordScreen';
import TA from '../components/atoms/TA';

export default function CreateAccountPasswordContainer({ navigation }: Props) {
    const [password, setPassword] = useState(!settings.isProduction() ? '' : '');
    const [password2, setPassword2] = useState(!settings.isProduction() ? '' : '');
    const [errorMessage, setErrorMessage] = useState('');
    const [confirmErrorMessage, setConfirmErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [trxUrl, setTrxUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showUsernameErrorModal, setShowUsernameErrorModal] = useState(false);
    const user = useUserStore().user;
    const errorStore = useErrorStore();

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
            await user.savePassword(password);
            const res = await user.createPerson();
            // this only works when blockchainUrl === localhost || https://...
            setTrxUrl(
                `https://local.bloks.io/transaction/${res.processed.id}?nodeUrl=${settings.config.blockchainUrl}&coreSymbol=SYS&systemDomain=eosio`
            );
        } catch (e) {
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

    async function onModalPress() {
        setShowModal(false);
        navigation.navigate('CreateAccountPin', { password });
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
                        <View>
                            <TH1 style={styles.headline}>Create password</TH1>
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
                    <View style={[commonStyles.marginBottom]}>
                        <View style={commonStyles.alignItemsCenter}>
                            <TP size={1} style={commonStyles.textAlignCenter}>
                                By continuing, you agree to our
                                <TA href={settings.config.links.termsAndConditions}> Terms & Conditions </TA>
                                and agree tonomy
                                <TA href={settings.config.links.privacyPolicy}> Privacy Policy </TA>
                            </TP>
                        </View>
                        <View style={commonStyles.marginBottom}>
                            <TInfoBox
                                align="left"
                                icon="security"
                                description="Your password is never sent or stored or seen except on your phone. Nobody, not even Tonomy Foundation, can pretend to be you."
                                linkUrl={settings.config.links.securityLearnMore}
                                linkUrlText="Learn more"
                            />
                        </View>
                    </View>
                }
                footer={
                    <View>
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
                        <View style={commonStyles.alignItemsCenter}>
                            <TP size={1}>
                                Already have an account? <TLink href="login">Login</TLink>
                            </TP>
                        </View>
                    </View>
                }
            ></LayoutComponent>
            <TErrorModal
                visible={showUsernameErrorModal}
                onPress={onUsernameErrorModalPress}
                title="Please choose another username"
                expected={true}
            >
                <View>
                    <Text>
                        Username <Text style={{ color: theme.colors.primary }}>{user.storage.username.username}</Text>{' '}
                        is already taken. Please choose another one.
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
                        Your username is{' '}
                        <Text style={{ color: theme.colors.primary }}>{user.storage.username.username}</Text>
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
    rememberPasswordText: {
        color: theme.colors.error,
    },
    headline: {
        fontWeight: 'bold',
    },
    passwordText: {
        alignSelf: 'flex-end',
    },
    labelText: {
        color: theme.colors.primary,
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
