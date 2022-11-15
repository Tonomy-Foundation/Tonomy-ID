import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import TLink from '../components/TA';
import { TH1 } from '../components/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { randomString, ExpectedSdkError } from 'tonomy-id-sdk';
import theme from '../utils/theme';
import TUsername from '../components/TUsername';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';

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
        <LayoutComponent
            body={
                <View>
                    <TH1>Create your username</TH1>

                    <TInfoBox
                        align="left"
                        icon="security"
                        description="Your username is private and can only be seen by you and those you share it with, not even Tonomy
                         Foundation can see it."
                        linkUrl={settings.config.links.securityLearnMore}
                        linkUrlText="Learn more"
                    />

                    <TUsername
                        errorText={errorMessage}
                        suffix={settings.config.accountSuffix}
                        value={username}
                        onChangeText={setUsername}
                        label="Username"
                    />
                </View>
            }
            footerHint={
                <View style={styles.changeUsername}>
                    <Text style={styles.greyText}>You can always change your username later</Text>
                </View>
            }
            footer={
                <View>
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
                            Already have an account?
                            <TLink href="login">Login</TLink>
                        </Text>
                    </View>
                </View>
            }
        ></LayoutComponent>
    );
}

const styles = StyleSheet.create({
    button: {
        marginBottom: 16,
    },
    centeredText: {
        alignItems: 'center',
    },
    changeUsername: {
        alignItems: 'center',
        marginBottom: 16,
    },
    greyText: {
        color: theme.colors.disabled,
    },
    bottomMessage: {
        color: theme.colors.disabled,
        fontSize: 16,
    },
});
