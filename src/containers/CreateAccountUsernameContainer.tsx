import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TButtonContained } from '../components/atoms/TButton';
import { TCaption, TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import useUserStore from '../store/userStore';
import { randomString, SdkError, SdkErrors } from '@tonomy/tonomy-id-sdk';
import TInputTextBox from '../components/TInputTextBox';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import theme, { commonStyles } from '../utils/theme';
import useErrorStore from '../store/errorStore';
import { Props } from '../screens/CreateAccountUsernameScreen';
import { formatUsername } from '../utils/username';
import { isNetworkError, NETWORK_ERROR_RESPONSE } from '../utils/errors';

export default function CreateAccountUsernameContainer({ navigation }: { navigation: Props['navigation'] }) {
    let startUsername = '';

    if (!settings.isProduction()) {
        startUsername = 'test' + randomString(2);
    }

    const [username, setUsername] = useState(startUsername);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const errorStore = useErrorStore();

    const { user } = useUserStore();

    async function onNext() {
        if (username.includes(' ')) {
            setErrorMessage('Username must not contain spaces');
            return;
        }

        setLoading(true);

        const formattedUsername = username.toLowerCase();

        try {
            await user.saveUsername(formattedUsername);
            navigation.navigate('CreatePassphrase');
        } catch (e: any) {
            if (e instanceof SdkError && e.code === SdkErrors.UsernameTaken) {
                setErrorMessage('Username already exists');
            } else if (isNetworkError(e)) {
                setErrorMessage(NETWORK_ERROR_RESPONSE);
            } else {
                errorStore.setError({ error: e, expected: false });
            }
        }

        setLoading(false);
    }

    const onTextChange = (value) => {
        setUsername(formatUsername(value));
        if (errorMessage !== '') setErrorMessage('');
    };

    return (
        <LayoutComponent
            body={
                <View>
                    <TH1 style={commonStyles.textAlignCenter}>Create username</TH1>
                    <View style={styles.innerContainer}>
                        <TP style={styles.inputHeader}>Username</TP>

                        <TInputTextBox errorText={errorMessage} value={username} onChangeText={onTextChange} />

                        {errorMessage.length <= 0 && (
                            <TCaption style={styles.caption}>You can always change your username later</TCaption>
                        )}
                    </View>
                </View>
            }
            footerHint={
                <TInfoBox
                    align="left"
                    icon="security"
                    description={`Your username is private and can only be seen by you and those you share it with, not even ${settings.config.ecosystemName} can see it.`}
                    linkUrl={settings.config.links.securityLearnMore}
                    linkUrlText="Learn more"
                />
            }
            footer={
                <View style={commonStyles.marginTop}>
                    <View style={commonStyles.marginBottom}>
                        <TButtonContained size="large" onPress={onNext} disabled={username.length === 0 || loading}>
                            Next
                        </TButtonContained>
                    </View>
                    <View style={styles.textContainer}>
                        <TP size={1}>Already have an account? </TP>
                        <TouchableOpacity onPress={() => navigation.navigate('LoginUsername')}>
                            <TP size={1} style={styles.link}>
                                Login
                            </TP>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    caption: {
        textAlign: 'right',
        fontSize: 14,
        color: theme.colors.grey2,
    },
    inputHeader: {
        color: theme.colors.text,
    },
    innerContainer: { marginTop: 10, justifyContent: 'center' },
    link: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        fontWeight: 'bold',
    },
});
