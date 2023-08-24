import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import LayoutComponent from '../components/layout';
import { TH1, TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import { Checkbox } from 'react-native-paper';
import { TButtonContained } from '../components/atoms/Tbutton';

const siteKey = '00000000-0000-0000-0000-000000000000';
const baseUrl = 'https://hcaptcha.com';

interface Props {
    navigation: any; // Change the type to match your navigation prop type
}

export default function HcaptchaContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [code, setCode] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>();
    const captchaFormRef = useRef<ConfirmHcaptcha | null>(null);

    useEffect(() => {
        // if (captchaFormRef.current) {
        //     captchaFormRef.current.show();
        // }
    }, []);

    const onMessage = (event: { nativeEvent: { data: string } }) => {
        if (event && event.nativeEvent.data) {
            const eventData = event.nativeEvent.data;

            if (['cancel'].includes(event.nativeEvent.data)) {
                if (captchaFormRef.current) {
                    captchaFormRef.current.hide();
                }

                setErrorMsg('You cancelled the challenge. Please try again!');
                setCode(eventData);
            } else if (['error', 'expired'].includes(event.nativeEvent.data)) {
                if (captchaFormRef.current) {
                    captchaFormRef.current.hide();
                }

                setErrorMsg('Challenge expired or some error occured. Please try again!');
                setCode(eventData);
            } else {
                console.log('Verified code from hCaptcha', event.nativeEvent.data);

                if (captchaFormRef.current) {
                    captchaFormRef.current.hide();
                }

                setCode(eventData);
            }
        }
    };

    async function onNext() {
        if (captchaFormRef.current) {
            captchaFormRef.current.hide();
            captchaFormRef.current = null;
            setCode(null);
        }

        navigation.navigate('CreateAccountPassword');
    }

    return (
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
                                baseUrl={baseUrl}
                                languageCode="en"
                                onMessage={onMessage}
                                sentry={false}
                                showLoading={false}
                            />

                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Checkbox
                                    status={code ? 'checked' : 'unchecked'}
                                    onPress={() => {
                                        if (captchaFormRef.current) {
                                            captchaFormRef.current.show();
                                        }
                                    }}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles.humanLabel}>I am human</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
            footer={
                <View style={commonStyles.marginTop}>
                    <View style={commonStyles.marginBottom}>
                        <TButtonContained onPress={onNext} disabled={!code}>
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
        ></LayoutComponent>
    );
}

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
});
