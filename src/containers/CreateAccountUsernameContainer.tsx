import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import TLink from '../components/TA';
import { TH1 } from '../components/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { randomString, ExpectedSdkError } from 'tonomy-id-sdk';
import theme from '../theme';
import TUsername from '../components/TUsername';

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
                {/* TODO change this to alert with icon */}
                <Text>
                    Your username is private and can only be seen by you and those you share it with, not even Tonomy
                    Foundation can see it. <TLink href={settings.config.links.usernameLearnMore}>Learn more</TLink>
                </Text>
            </View>
            <View style={styles.username}>
                <TUsername
                    errorText={errorMessage}
                    suffix={settings.config.accountSuffix}
                    value={username}
                    onChangeText={setUsername}
                    label="Username"
                />
            </View>
            <View style={styles.centeredText}>
                <Text style={styles.greyText}>You can always change your username later</Text>
            </View>

            <View style={styles.button}>
                <TButton onPress={onNext} disabled={username.length === 0} loading={loading}>
                    Next
                </TButton>
            </View>
            <View style={styles.centeredText}>
                <Text style={styles.bottomMessage}>
                    Already have an account? <TLink href="login">Login</TLink>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    username: {
        marginBottom: 100,
    },
    button: {
        marginTop: 24,
        marginBottom: 16,
    },
    centeredText: {
        alignItems: 'center',
    },
    greyText: {
        color: theme.colors.disabled,
    },
    bottomMessage: {
        color: theme.colors.disabled,
        fontSize: 16,
    },
});
