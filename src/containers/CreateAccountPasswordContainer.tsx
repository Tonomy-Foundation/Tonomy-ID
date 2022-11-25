import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import TPasswordInput from '../components/TPasswordInput';
import TLink from '../components/TA';
import { TH1 } from '../components/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { SdkError, SdkErrors } from 'tonomy-id-sdk';
import theme from '../utils/theme';
import TModal from '../components/TModal';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';

export default function CreateAccountPasswordContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const [password, setPassword] = useState(!settings.isProduction() ? 'kh6oH0CZRz09*jmgZ7*d' : '');
    const [password2, setPassword2] = useState(!settings.isProduction() ? 'kh6oH0CZRz09*jmgZ7*d' : '');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [trxUrl, setTrxUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showUsernameErrorModal, setShowUsernameErrorModal] = useState(false);

    const user = useUserStore().user;

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
            // TODO catch password errors as well
            if (e instanceof SdkError) {
                switch (e.code) {
                    case SdkErrors.UsernameTaken:
                        setShowUsernameErrorModal(true);
                        break;
                    case SdkErrors.PasswordFormatInvalid:
                        setErrorMessage('Password is invalid.');
                        break;
                    case SdkErrors.PasswordTooCommon:
                        setErrorMessage('Password contains words or phrases that are common in passwords.');
                        break;
                    default:
                        throw e;
                }
                setLoading(false);
                return;
            } else {
                setLoading(false);
                throw e;
            }
        }

        setLoading(false);

        setShowModal(true);
    }

    async function onModalPress() {
        setShowModal(false);
        navigation.navigate('fingerprint');
    }

    async function onUsernameErrorModalPress() {
        setShowUsernameErrorModal(false);
        navigation.navigate('createAccountUsername');
    }

    return (
        <View style={layoutStyles.container}>
            <LayoutComponent
                body={
                    <View>
                        <View>
                            <TH1>Create your password</TH1>

                            <TInfoBox
                                align="left"
                                icon="security"
                                description="Your password is never sent or stored or seen except on your phone. Nobody, not even Tonomy Foundation, can pretend to be you."
                                linkUrl={settings.config.links.securityLearnMore}
                                linkUrlText="Learn more"
                            />

                            <TPasswordInput
                                value={password}
                                onChangeText={setPassword}
                                errorText={errorMessage}
                                label="Master Password"
                            />
                            <TPasswordInput
                                value={password2}
                                onChangeText={setPassword2}
                                label="Confirm Master Password"
                            />
                            <View style={styles.centeredText}>
                                Minimum 12 characters with uppercase, numbers and symbols
                            </View>
                        </View>
                        <View style={styles.centeredText}>
                            <Text style={styles.rememberPasswordText}>
                                Please remember your master password for future use
                            </Text>
                        </View>
                    </View>
                }
                footer={
                    <View>
                        <View style={styles.button}>
                            <TButton
                                mode="contained"
                                onPress={onNext}
                                disabled={password.length === 0 || password2.length === 0 || loading}
                                loading={loading}
                            >
                                Next
                            </TButton>
                        </View>
                        <View style={styles.centeredText}>
                            <Text style={styles.bottomMessage}>
                                Already have an account? <TLink href="login">Login</TLink>
                            </Text>
                        </View>
                    </View>
                }
            ></LayoutComponent>
            <TModal
                visible={showUsernameErrorModal}
                onPress={onUsernameErrorModalPress}
                icon="alert-circle"
                iconColor={theme.colors.error}
                title="Please choose another username"
            >
                <View>
                    <Text>
                        Username <Text style={{ color: theme.colors.primary }}>{user.storage.username}</Text> is already
                        taken. Please choose another one.
                    </Text>
                </View>
            </TModal>
            <TModal
                visible={showModal}
                onPress={onModalPress}
                icon="check"
                title={'Welcome to ' + settings.config.ecosystemName}
            >
                <View>
                    <Text>
                        Your username is <Text style={{ color: theme.colors.primary }}>{user.storage.username}</Text>
                    </Text>
                </View>
                <View style={styles.space}>
                    <Text>
                        See it on the blockchain <TLink href={trxUrl}>here</TLink>
                    </Text>
                </View>
            </TModal>
        </View>
    );
}

const layoutStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

const styles = StyleSheet.create({
    space: {
        marginTop: 6,
    },
    button: {
        marginTop: 24,
        marginBottom: 16,
    },
    centeredText: {
        alignItems: 'center',
    },
    rememberPasswordText: {
        alignSelf: 'center',
        marginTop: 40,
        color: theme.colors.error,
    },
    greyText: {
        color: theme.colors.disabled,
    },
    bottomMessage: {
        color: theme.colors.disabled,
        fontSize: 16,
    },
});
