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
import { randomString, ExpectedSdkError } from 'tonomy-id-sdk';

export default function CreateAccountContainer({ navigation }: { navigation: NavigationProp<any> }) {
    let startUsername = '';
    if (!settings.isProduction()) {
        startUsername = 'test';
        // startUsername = 'test' + randomString(2);
    }
    const [username, setUsername] = useState(startUsername);
    const [password, setPassword] = useState(!settings.isProduction() ? 'Password123!' : '');
    const [loading, setLoading] = useState(false);

    const user = useUserStore().user;

    async function onNext() {
        setLoading(true);

        // TODO error handling here
        await user.saveUsername(username, settings.config.accountSuffix);
        await user.savePassword(password);
        try {
            await user.createPerson();
        } catch (e) {
            console.log('error', e, e.code);
            if (e instanceof ExpectedSdkError && e.code === 'TSDK1001') {
                console.log('Username already exists');
                // TODO show error
            }

            setLoading(false);
            throw e;
        }

        setLoading(false);
        navigation.navigate('fingerprint');
    }

    return (
        <View style={styles.container}>
            <View>
                <TH1>Create your username and password</TH1>
            </View>
            <View>
                <Text>Get started with your account on {settings.config.appName}</Text>
            </View>
            <View>
                <View style={styles.username}>
                    <TTextInput
                        value={username}
                        onChangeText={setUsername}
                        style={styles.usernameInput}
                        label="Username"
                    />
                    <Text style={styles.accountSuffix}>{settings.config.accountSuffix}</Text>
                </View>
                <TPasswordInput value={password} onChangeText={setPassword} label="Password" />
                <TPasswordInput label="Confirm Password" />
            </View>

            <View>
                <TButton onPress={onNext} loading={loading}>
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
    username: {
        flexDirection: 'row',
    },
    usernameInput: {
        width: '80%',
    },
    accountSuffix: {
        width: '20%',
    },
});
