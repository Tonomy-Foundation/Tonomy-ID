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

export default function CreateAccountContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const [username, setUsername] = useState(!settings.isProduction() ? 'testaccount' : '');
    const [password, setPassword] = useState(!settings.isProduction() ? 'Password123!' : '');
    const [loading, setLoading] = useState(false);

    const user = useUserStore().user;

    async function onNext() {
        console.log(username, password);

        setLoading(true);
        await user.saveUsername(username);
        await user.savePassword(password);
        await user.createPerson();
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
