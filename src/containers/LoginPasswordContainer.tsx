import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

import { useTheme } from 'react-native-paper';
import { AccountType, SdkError, SdkErrors, TonomyUsername } from '@tonomy/tonomy-id-sdk';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import TPasswordInput from '../components/molecules/TPasswordInput';
import TErrorModal from '../components/TErrorModal';
import TInfoBox from '../components/TInfoBox';
import { Props } from '../screens/homeScreen';
import settings from '../settings';
// import errorStore from '../store/errorStore';
import useUserStore from '../store/userStore';
import theme, { commonStyles } from '../utils/theme';
import useErrorStore from '../store/errorStore';
import { generatePrivateKeyFromPassword } from '../utils/keys';

export default function LoginPasswordContainer({
    navigation,
    username,
}: {
    navigation: Props['navigation'];
    username: string;
}) {
    const errorsStore = useErrorStore();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showUsernameErrorModal, setShowUsernameErrorModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = useUserStore().user;
    const onNext = async () => {
        setLoading(true);

        try {
            const result = await user.login(
                TonomyUsername.fromUsername(username, AccountType.PERSON, settings.config.accountSuffix),
                password,
                { keyFromPasswordFn: generatePrivateKeyFromPassword }
            );

            if (result?.account_name !== undefined) {
                setPassword('');
                navigation.navigate('CreateAccountPin', {
                    password: password,
                    action: 'LOGIN_ACCOUNT',
                });
            }
        } catch (e: any) {
            if (e instanceof SdkError) {
                switch (e.code) {
                    case SdkErrors.UsernameNotFound:
                    case SdkErrors.PasswordFormatInvalid:
                        // case SdkErrors.PasswordInValid:
                        setShowUsernameErrorModal(true);
                        break;
                    case SdkErrors.AccountDoesntExist:
                        setErrorMessage('Account does not exist');
                        break;
                    default:
                        errorsStore.setError({ error: e, expected: false });
                }

                setLoading(false);
                return;
            } else {
                errorsStore.setError({ error: e, expected: false });
                setLoading(false);
                return;
            }
        }
    };

    const {
        colors: { text },
    } = useTheme();
    const stylesColor = StyleSheet.create({
        text: {
            color: text,
        },
    });

    async function onUsernameErrorModalPress() {
        setShowUsernameErrorModal(false);
        // navigation.navigate('CreateAccountUsername');
    }

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1>Password</TH1>
                        <View style={styles.container}>
                            <View style={styles.innerContainer}>
                                <TP size={1}>Password</TP>
                                <TPasswordInput value={password} onChangeText={setPassword} />
                            </View>
                        </View>
                    </View>
                }
                footerHint={
                    <View style={commonStyles.marginBottom}>
                        <TInfoBox
                            align="left"
                            icon="security"
                            description="Your password Is never sent or stored or seen except on your phone. Nobody, not even Tonomy Foundation, can pretend to be you. "
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>
                }
                footer={
                    <View>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained onPress={onNext} disabled={password.length === 0}>
                                NEXT
                            </TButtonContained>
                        </View>
                        <View style={styles.textContainer}>
                            <TP size={1}>{"Don't have an account? "}</TP>
                            <TouchableOpacity onPress={() => navigation.navigate('CreateAccountUsername')}>
                                <TP size={1} style={styles.link}>
                                    Sign up
                                </TP>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            ></LayoutComponent>
            <TErrorModal
                visible={showUsernameErrorModal}
                onPress={onUsernameErrorModalPress}
                title="Wrong Username/Password"
                expected={true}
            >
                <View>
                    <Text>The username/password is incorrect!</Text>
                </View>
            </TErrorModal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    innerContainer: {
        width: '100%',
        height: '60%',
    },
    link: {
        color: theme.colors.primary,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
