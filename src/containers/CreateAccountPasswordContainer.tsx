import React, { useState } from 'react';
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

export default function CreateAccountPasswordContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const [password, setPassword] = useState(!settings.isProduction() ? 'k^3dTEqXfolCPo5^QhmD' : '');
    const [password2, setPassword2] = useState(!settings.isProduction() ? 'k^3dTEqXfolCPo5^QhmD' : '');
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
        navigation.navigate('fingerprint', { password });
    }

    async function onUsernameErrorModalPress() {
        setShowUsernameErrorModal(false);
        navigation.navigate('createAccountUsername');
    }

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <View>
                            <TH1>Create your password</TH1>

                            <View style={commonStyles.marginBottom}>
                                <TInfoBox
                                    align="left"
                                    icon="security"
                                    description="Your password is never sent or stored or seen except on your phone. Nobody, not even Tonomy Foundation, can pretend to be you."
                                    linkUrl={settings.config.links.securityLearnMore}
                                    linkUrlText="Learn more"
                                />
                            </View>

                            <TPasswordInput
                                value={password}
                                onChangeText={setPassword}
                                errorText={errorMessage}
                                label="Master Password"
                                style={commonStyles.marginBottom}
                            />
                            <TPasswordInput
                                value={password2}
                                onChangeText={setPassword2}
                                label="Confirm Master Password"
                                style={commonStyles.marginBottom}
                            />
                            <View style={commonStyles.alignItemsCenter}>
                                <TCaption>Minimum 12 characters with lower and uppercase letter and numbers</TCaption>
                            </View>
                        </View>
                    </View>
                }
                footerHint={
                    <View style={[commonStyles.marginBottom, commonStyles.alignItemsCenter]}>
                        <TP size={1} style={[styles.rememberPasswordText, commonStyles.textAlignCenter]}>
                            Please remember your master password for future use
                        </TP>
                    </View>
                }
                footer={
                    <View>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained
                                onPress={onNext}
                                disabled={password.length === 0 || password2.length === 0 || loading}
                                loading={loading}
                            >
                                Next
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
            <TModal
                visible={showUsernameErrorModal}
                onPress={onUsernameErrorModalPress}
                icon="alert-circle"
                iconColor={theme.colors.error}
                title="Please choose another username"
            >
                <View>
                    <Text>
                        Username <Text style={{ color: theme.colors.primary }}>{user.storage.username.username}</Text>{' '}
                        is already taken. Please choose another one.
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
});
