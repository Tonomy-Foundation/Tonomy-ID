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
    const [password, setPassword] = useState(!settings.isProduction() ? 'k^3dTEqXfolCPo5^QhmD' : '');
    const [errorMessage, setErrorMessage] = useState('');
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
                    case SdkErrors.PasswordInvalid:
                    case SdkErrors.PasswordFormatInvalid:
                    case SdkErrors.AccountDoesntExist:
                        setErrorMessage('Username or password are incorrect. Please try again.');
                        break;
                    default:
                        setErrorMessage('');
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

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={commonStyles.textAlignCenter}>Password</TH1>
                        <View style={styles.container}>
                            <View style={styles.innerContainer}>
                                <TP size={1}>Password</TP>
                                <TPasswordInput value={password} onChangeText={setPassword} errorText={errorMessage} />
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
                            <TButtonContained onPress={onNext} disabled={password.length === 0} loading={loading}>
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
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '90%',
        justifyContent: 'center',
    },
    innerContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    link: {
        color: theme.colors.primary,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
