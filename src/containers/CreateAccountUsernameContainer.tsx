import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import TTextInput from '../components/TTextInput';
import TLink from '../components/TA';
import { TH1 } from '../components/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { randomString, ExpectedSdkError } from 'tonomy-id-sdk';

export default function CreateAccountUsernameContainer({ navigation }: { navigation: NavigationProp<any> }) {
    let startUsername = '';
    if (!settings.isProduction()) {
        startUsername = 'test' + randomString(2);
    }
    const [username, setUsername] = useState(startUsername);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const user = useUserStore().user;

    async function onNext() {
        setLoading(true);

        try {
            await user.saveUsername(username, settings.config.accountSuffix);
        } catch (e) {
            if (e instanceof ExpectedSdkError && e.code === 'TSDK1000') {
                setErrorMessage('Username already exists');
                setLoading(false);
                return;
            } else {
                setLoading(false);
                // TODO throw unexpected error
                throw e;
            }
        }

        setLoading(false);
        navigation.navigate('createAccountPassword');
    }

    return (
        <View style={styles.container}>
            <View>
                <TH1>Create your username</TH1>
            </View>
            <View>
                <Text>
                    Your username is private and can only be seen by you and those you share it with, not even Tonomy
                    Foundation can see it. <TLink href={settings.config.links.usernameLearnMore}>Learn more</TLink>
                </Text>
            </View>
            <View>
                <View style={styles.username}>
                    <TTextInput
                        value={username}
                        onChangeText={setUsername}
                        style={styles.usernameInput}
                        label="Username"
                        errorText={errorMessage}
                    />
                    <Text style={styles.accountSuffix}>{settings.config.accountSuffix}</Text>
                </View>
            </View>
            <View>
                <Text>You can always change your username later</Text>
            </View>

            <View>
                <TButton onPress={onNext} disabled={username.length === 0} loading={loading}>
                    Next
                </TButton>
            </View>
            <View>
                <Text>
                    Already have an account? <TLink href="login">Login</TLink>
                </Text>
            </View>

            {/* <StatusBar style="auto" /> */}
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
