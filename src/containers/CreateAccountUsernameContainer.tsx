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
        <View style={layoutStyles.container}>
            <View style={layoutStyles.title}>
                <TH1>Create your username</TH1>
            </View>
            <View style={layoutStyles.body}>
                <View style={styles.message}>
                    {/* TODO change this to alert with icon */}
                    <Text>
                        Your username is private and can only be seen by you and those you share it with, not even
                        Tonomy Foundation can see it.{' '}
                        <TLink href={settings.config.links.usernameLearnMore}>Learn more</TLink>
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
            </View>
            <View style={layoutStyles.bottom}>
                <View style={styles.button}>
                    <TButton
                        onPress={onNext}
                        mode="contained"
                        disabled={username.length === 0 || loading}
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
        height: `20%`,
    },
    username: {
        height: '20%',
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
