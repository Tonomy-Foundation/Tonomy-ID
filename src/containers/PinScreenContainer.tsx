/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import TButton, { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TH1 } from '../components/atoms/THeadings';
import TPin from '../components/TPin';
import useUserStore from '../store/userStore';
import { HelperText } from 'react-native-paper';
import LayoutComponent from '../components/layout';
import useErrorStore from '../store/errorStore';
import { Props } from '../screens/PinScreen';
import theme, { commonStyles } from '../utils/theme';
import TInfoBox from '../components/TInfoBox';
import settings from '../settings';

export default function PinScreenContainer({
    navigation,
    password,
    action,
}: {
    navigation: Props['navigation'];
    password?: string;
    action?: string;
}) {
    const [confirming, setConfirming] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [matched, setMatched] = useState<boolean>(false);
    const user = useUserStore().user;
    const errorStore = useErrorStore();

    function onPinChange(pin: string) {
        setPin(pin);
        setDisabled(pin.length < 5);
        setErrorMessage('');
    }

    async function checkPin() {
        // Logic for Checking pin
        // if correct then allow to enter and confirm then check  and update pin
        // else show error to enter correct pin
        setPin('');
        setDisabled(true);
        setMatched(true);
        setErrorMessage('');

        // setErrorMessage('Wrong PIN');
    }

    async function onNext() {
        setLoading(true);

        if (confirming) {
            if (pin === confirmPin) {
                try {
                    if (action === 'CREATE_ACCOUNT' || action === 'LOGIN_ACCOUNT') {
                        await user.savePIN(confirmPin);
                        if (!password) throw new Error("Password can't be empty");
                        navigation.navigate('CreateAccountFingerprint', { password });
                    } else if (action === 'ADD_PIN') {
                        await user.savePIN(confirmPin);
                        navigation.goBack();
                    } else if (action === 'CHANGE_PIN') {
                        await user.savePIN(confirmPin);
                        navigation.goBack();
                    }
                } catch (e: any) {
                    console.log('error saving pin', e);
                    errorStore.setError({ error: e, expected: false });
                    setLoading(false);
                    return;
                }
            } else {
                setErrorMessage('Wrong PIN');
                setPin('');
                setConfirmPin('');
                setConfirming(false);
            }
        } else {
            setConfirmPin(pin);
            setPin('');
            setDisabled(true);
            setConfirming(true);
        }

        setLoading(false);
    }

    return (
        <LayoutComponent
            body={
                <View style={styles.header}>
                    <View>
                        <TH1 style={commonStyles.marginTopTextCenter}>
                            {action === 'CHANGE_PIN'
                                ? (matched === false ? 'Enter current Pin' : confirming)
                                    ? 'Repeat new PIN'
                                    : 'Create new Pin'
                                : ''}

                            {action === 'CREATE_ACCOUNT' || action === 'LOGIN_ACCOUNT'
                                ? confirming
                                    ? 'Repeat your PIN'
                                    : 'Add a PIN'
                                : ''}
                        </TH1>
                    </View>
                    <View>
                        <Text style={{ ...styles.accountSecureText, ...commonStyles.textAlignCenter }}>
                            {action !== 'CHANGE_PIN' && 'This helps keep your account secure'}
                        </Text>
                    </View>
                    <View style={styles.centeredText}>
                        <HelperText type="error" visible={errorMessage !== ''}>
                            {errorMessage}
                        </HelperText>
                    </View>
                    <TPin pin={pin} onChange={onPinChange}></TPin>
                </View>
            }
            footerHint={
                <View style={commonStyles.marginBottom}>
                    <TInfoBox
                        align="left"
                        icon="security"
                        description="100% private. Your PIN data never leave your phone. Learn more"
                        linkUrl={settings.config.links.securityLearnMore}
                        linkUrlText="Learn more"
                    />
                </View>
            }
            footer={
                <View>
                    <TButtonContained
                        disabled={disabled || loading}
                        onPress={action === 'CHANGE_PIN' ? (matched === false ? checkPin : onNext) : onNext}
                        style={styles.marginBottom}
                    >
                        {confirming ? 'Confirm' : 'Next'}
                    </TButtonContained>
                    {!confirming && (
                        <TButtonOutlined
                            onPress={() => {
                                if (action === 'CHANGE_PIN') { navigation.goBack() }
                                else {
                                    if (!password) throw new Error("Password can't be empty");
                                    navigation.navigate('CreateAccountFingerprint', { password });
                                }
                            }}
                            style={styles.marginBottom}
                        >
                            {action === 'CHANGE_PIN' ? 'Cancel' : 'Skip'}
                        </TButtonOutlined>
                    )}
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
    },
    centeredText: {
        alignItems: 'center',
    },
    marginBottom: {
        marginBottom: 16,
        fontSize: 15,
    },
    accountSecureText: {
        color: theme.colors.placeholder,
    },
});
