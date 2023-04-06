import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import TLink from '../components/atoms/TA';
import { TCaption, TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { randomString, SdkError, SdkErrors } from '@tonomy/tonomy-id-sdk';
import TUsername from '../components/TUsername';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import theme, { commonStyles } from '../utils/theme';
import useErrorStore from '../store/errorStore';
import { Props } from '../screens/CreateAccountUsernameScreen';

export default function CreateAccountUsernameContainer({ navigation }: Props) {
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
        setLoading(true);

        try {
            await user.saveUsername(username);
        } catch (e: any) {
            if (e instanceof SdkError && e.code === SdkErrors.UsernameTaken) {
                setErrorMessage('Username already exists');
                setLoading(false);
                return;
            } else {
                errorStore.setError({ error: e, expected: false });
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        navigation.navigate('CreateAccountPassword');
    }

    const onTextChange = (value) => {
        setUsername(value);
        if (errorMessage !== '') setErrorMessage('');
    };

    return (
        <LayoutComponent
            body={
                <View>
                    <TH1 style={commonStyles.textAlignCenter}>Create username</TH1>
                    <View style={styles.innerContainer}>
                        <TP style={styles.inputHeader}>Username</TP>
                        <View style={styles.inputContainer}>
                            <TUsername errorText={errorMessage} value={username} onChangeText={setUsername} />
                        </View>
                        <TCaption style={styles.caption}>You can always change your username later</TCaption>
                    </View>
                </View>
            }
            footerHint={
                <View style={[commonStyles.alignItemsCenter, commonStyles.marginBottom]}>
                    <View style={styles.marginBottom}>
                        <TInfoBox
                            align="left"
                            icon="security"
                            description="Your username is private and can only be seen by you and those you share it with, not even Tonomy
                         Foundation can see it."
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>
                </View>
            }
            footer={
                <View>
                    <View style={commonStyles.marginBottom}>
                        <TButtonContained
                            onPress={onNext}
                            disabled={username.length === 0 || loading}
                            loading={loading}
                        >
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
        color: '#939393',
    },
    inputHeader: {
        color: '#939393',
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: theme.colors.disabled,
        borderRadius: 8,
    },
    innerContainer: { height: '90%', justifyContent: 'center' },
    link: {
        color: theme.colors.primary,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
