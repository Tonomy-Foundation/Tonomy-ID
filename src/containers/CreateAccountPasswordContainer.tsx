import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import TPasswordInput from '../components/TPasswordInput';
import TLink from '../components/TA';
import { TH1 } from '../components/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { ExpectedSdkError } from 'tonomy-id-sdk';
import theme from '../utils/theme';
import TModal from '../components/TModal';

export default function CreateAccountPasswordContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const [password, setPassword] = useState(!settings.isProduction() ? 'Password123!' : '');
    const [password2, setPassword2] = useState(!settings.isProduction() ? 'Password123!' : '');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [trxUrl, setTrxUrl] = useState('');
    const [showModal, setShowModal] = useState(false);

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
            setTrxUrl(
                `https://local.bloks.io/transaction/${res.processed.id}?nodeUrl=${settings.config.blockchainUrl}&coreSymbol=SYS&systemDomain=eosio`
            );
            console.log(
                `https://local.bloks.io/transaction/${res.processed.id}?nodeUrl=${settings.config.blockchainUrl}&coreSymbol=SYS&systemDomain=eosio`
            );
        } catch (e) {
            // TODO catch password errors as well
            if (e instanceof ExpectedSdkError && e.code === 'TSDK1001') {
                console.log('Username already exists');
                // TODO need to send user back to username screen. Show modal with error and redirect
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

    return (
        <View style={layoutStyles.container}>
            <TModal
                visible={showModal}
                onPress={onModalPress}
                icon="check"
                title={'Welcome to' + settings.config.ecosystemName}
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
            <View style={layoutStyles.title}>
                <TH1>Create your password</TH1>
            </View>
            <View style={layoutStyles.body}>
                <View style={styles.message}>
                    {/* TODO change this to alert with icon */}
                    <Text>
                        Your password is never sent or stored or seen except on your phone. Nobody, not even Tonomy
                        Foundation, can pretend to be you.{' '}
                        <TLink href={settings.config.links.passwordLearnMore}>Learn more</TLink>
                    </Text>
                </View>
                <View style={styles.password}>
                    <TPasswordInput
                        value={password}
                        onChangeText={setPassword}
                        errorText={errorMessage}
                        label="Master Password"
                    />
                    <TPasswordInput value={password2} onChangeText={setPassword2} label="Confirm Master Password" />
                </View>
                <View style={styles.centeredText}>
                    <Text style={styles.rememberPasswordText}>Please remember your master password for future use</Text>
                </View>
            </View>
            <View style={layoutStyles.bottom}>
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
        </View>
    );
}

const layoutStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        height: '10%',
    },
    body: {
        height: `60%`,
    },
    bottom: {
        height: `30%`,
    },
});

const styles = StyleSheet.create({
    message: {
        height: '20%',
    },
    password: {
        height: '40%',
    },
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
