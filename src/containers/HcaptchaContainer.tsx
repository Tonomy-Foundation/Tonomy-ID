import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import LayoutComponent from '../components/layout';
import { TH1, TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import { Checkbox } from 'react-native-paper';
import { TButtonContained } from '../components/atoms/Tbutton';
import { SdkError, SdkErrors } from '@tonomy/tonomy-id-sdk';
import { Props } from '../screens/HcaptchaScreen';
import settings from '../settings';
import useUserStore, { UserStatus } from '../store/userStore';
import TModal from '../components/TModal';
import useErrorStore from '../store/errorStore';
import TLink from '../components/atoms/TA';
import TErrorModal from '../components/TErrorModal';

export default function HcaptchaContainer({
    navigation,
    password,
}: {
    navigation: Props['navigation'];
    password: string;
}) {
    const [code, setCode] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const captchaFormRef = useRef<ConfirmHcaptcha | null>(null);
    const [loading, setLoading] = useState(false);
    const [accountUrl, setAccountUrl] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showUsernameErrorModal, setShowUsernameErrorModal] = useState(false);
    const userStore = useUserStore();
    const user = userStore.user;
    const siteKey = settings.config.captchaSiteKey;

    const errorStore = useErrorStore();
    const [username, setUsername] = useState('');

    const onMessage = (event: { nativeEvent: { data: string } }) => {
        if (event && event.nativeEvent.data) {
            const eventData = event.nativeEvent.data;

            if (['cancel'].includes(event.nativeEvent.data)) {
                if (captchaFormRef.current) {
                    captchaFormRef.current.hide();
                }

                setErrorMsg('You cancelled the challenge. Please try again.');
                setCode(eventData);
            } else if (['error', 'expired'].includes(event.nativeEvent.data)) {
                if (captchaFormRef.current) {
                    captchaFormRef.current.hide();
                }

                setErrorMsg('Challenge expired or some error occured. Please try again.');
                setCode(eventData);
            } else {
                console.log('Verified code from hCaptcha', event.nativeEvent.data);

                if (captchaFormRef.current) {
                    captchaFormRef.current.hide();
                }

                if (process.env.NODE_ENV === 'development') {
                    setCode(settings.config.captchaToken);
                } else {
                    setCode(eventData);
                }

                setSuccess(true);
            }
        }
    };

    async function setUserName() {
        try {
            const username = await user.getUsername();

            setUsername(username.getBaseUsername());
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onNext() {
        setLoading(true);

        try {
            await user.saveCaptchaToken(code);
            await user.createPerson();
            await user.updateKeys(password);

            await setUserName();
            const url =
                'https://local.bloks.io/account/' +
                (await user.getAccountName()).toString() +
                '?nodeUrl=' +
                settings.config.blockchainUrl;

            setAccountUrl(url);
        } catch (e) {
            if (e instanceof SdkError) {
                switch (e.code) {
                    case SdkErrors.UsernameTaken:
                        setShowUsernameErrorModal(true);
                        break;
                    default:
                        errorStore.setError({ error: e, expected: false });
                }

                setLoading(false);
                return;
            } else {
                errorStore.setError({ error: e, expected: false });
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        setShowModal(true);

        if (captchaFormRef.current) {
            captchaFormRef.current.hide();
            setCode(null);
        }
    }

    async function onUsernameErrorModalPress() {
        setShowUsernameErrorModal(false);
        navigation.navigate('CreateAccountUsername');
    }

    async function onModalPress() {
        userStore.setStatus(UserStatus.LOGGED_IN);
        setShowModal(false);
    }

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[commonStyles.textAlignCenter]}>Human Verification</TH1>
                        <View style={styles.container}>
                            {errorMsg && <TP style={styles.errorMsg}>{errorMsg}</TP>}

                            <View>
                                <ConfirmHcaptcha
                                    size="invisible"
                                    ref={captchaFormRef}
                                    siteKey={siteKey}
                                    languageCode="en"
                                    onMessage={onMessage}
                                    sentry={false}
                                    showLoading={false}
                                />

                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Checkbox
                                            status={code ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                if (captchaFormRef.current) {
                                                    captchaFormRef.current.show();
                                                    setErrorMsg(null);
                                                }
                                            }}
                                            color={theme.colors.primary}
                                        />
                                        <Text style={styles.humanLabel}>I am human</Text>
                                    </View>
                                    <Image
                                        source={require('../assets/images/hcaptcha.png')}
                                        style={styles.imageStyle}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                }
                footer={
                    <View style={commonStyles.marginTop}>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained onPress={onNext} disabled={!code || loading || !success}>
                                Create Account
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
            ></LayoutComponent>
            <TErrorModal
                visible={showUsernameErrorModal}
                onPress={onUsernameErrorModalPress}
                title="Please choose another username"
                expected={true}
            >
                <View>
                    <Text>
                        Username <Text style={{ color: theme.colors.primary }}>{username}</Text> is already taken.
                        Please choose another one.
                    </Text>
                </View>
            </TErrorModal>
            <TModal
                visible={showModal}
                onPress={onModalPress}
                icon="check"
                title={'Welcome to ' + settings.config.ecosystemName}
            >
                <View>
                    <Text>
                        Your username is <Text style={{ color: theme.colors.primary }}>{username}</Text>
                    </Text>
                </View>
                <View style={errorModalStyles.marginTop}>
                    <Text>
                        See it on the blockchain <TLink href={accountUrl}>here</TLink>
                    </Text>
                </View>
            </TModal>
        </>
    );
}

const errorModalStyles = StyleSheet.create({
    marginTop: {
        marginTop: 6,
    },
});

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: 'rgb(224, 224, 224)',
        backgroundColor: 'rgb(250, 250, 250)',
        paddingHorizontal: 11,
        paddingVertical: 14,
        marginTop: 80,
    },
    humanLabel: {
        color: '#555555',
        fontSize: 16,
        marginLeft: 4,
    },
    headline: {
        marginTop: 5,
        fontSize: 24,
    },
    innerContainer: {
        marginTop: 5,
        justifyContent: 'center',
    },
    link: {
        color: theme.colors.primary,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    errorMsg: {
        color: '#E95733',
        fontSize: 12,
        marginLeft: 8,
        marginBottom: 0,
    },
    imageStyle: {
        width: 30,
        height: 30,
    },
});
