import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import TTextInput from '../components/TTextInput';
import TPasswordInput from '../components/TPasswordInput';
import TLink from '../components/TA';
import { TH1 } from '../components/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { ExpectedSdkError } from 'tonomy-id-sdk';
import theme from '../theme';

export default function CreateAccountPasswordContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const [password, setPassword] = useState(!settings.isProduction() ? 'Password123!' : '');
    const [password2, setPassword2] = useState(!settings.isProduction() ? 'Password123!' : '');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const user = useUserStore().user;

    async function onNext() {
        if (password !== password2) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await user.savePassword(password);
            await user.createPerson();
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
        navigation.navigate('fingerprint');
    }

    return (
        <View style={styles.container}>
            <View>
                <TH1>Create your password</TH1>
            </View>
            <View>
                <Text>Get started with your account on {settings.config.appName}</Text>
            </View>
            <View>
                <TPasswordInput value={password} onChangeText={setPassword} errorText={errorMessage} label="Password" />
                <TPasswordInput value={password2} onChangeText={setPassword2} label="Confirm Password" />
            </View>
            <View>
                <Text style={styles.rememberPasswordText}>Please remember your password for future use</Text>
            </View>
            <View>
                <TButton onPress={onNext} disabled={password.length === 0 || password2.length === 0} loading={loading}>
                    Next
                </TButton>
            </View>
            <View>
                <Text>
                    Already have an account? <TLink>Login</TLink>
                </Text>
            </View>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    rememberPasswordText: {
        color: theme.colors.error,
    },
});
