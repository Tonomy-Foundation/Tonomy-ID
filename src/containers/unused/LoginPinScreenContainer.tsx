import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton, { TButtonContained, TButtonOutlined } from '../../components/atoms/TButton';
import { TH1 } from '../../components/atoms/THeadings';
import TPin from '../../components/TPin';
import useUserStore from '../../store/userStore';
import { HelperText } from 'react-native-paper';
import LayoutComponent from '../../components/layout';
import useErrorStore from '../../store/errorStore';
// import { Props } from '../screens/LoginPinScreen';

import theme from '../../utils/theme';

export default function LoginPinScreenContainer({
    // navigation,
    password,
}: {
    // navigation: Props['navigation'];
    password: string;
}) {
    const [disabled, setDisabled] = useState(true);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const user = useUserStore().user;
    const errorStore = useErrorStore();

    function onPinChange(pin: string) {
        setPin(pin);
        setDisabled(pin.length < 5);
        setErrorMessage('');
    }

    //  Navigated to Create Finger Print Screen on Skip
    function onSkip() {
        // navigation.navigate('CreateAccountFingerprint', { password });
    }

    // When the Next button is removed then it will be called when the 5 digits are entered
    async function onNext() {
        setLoading(true);

        if (pin === confirmPin) {
            try {
                await user.savePIN(confirmPin);
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
                setLoading(false);
                return;
            }

            // navigation.navigate('CreateAccountFingerprint', { password });
        } else {
            setErrorMessage('Wrong PIN');
            setPin('');
        }
    }

    return (
        <LayoutComponent
            body={
                <View style={styles.header}>
                    <View>
                        <TH1>{'Enter Your Pin'}</TH1>
                    </View>
                    <View>
                        <Text style={styles.InfoText}>Enter Pin to Login</Text>
                    </View>
                    <View style={styles.centeredText}>
                        <HelperText type="error" visible={errorMessage !== ''}>
                            {errorMessage}
                        </HelperText>
                    </View>
                    <TPin pin={pin} onChange={onPinChange}></TPin>
                </View>
            }
            footer={
                <View>
                    <TButtonContained disabled={loading} onPress={onNext} style={styles.marginBottom}>
                        {'Next'}
                    </TButtonContained>
                    <TButtonOutlined onPress={onSkip} style={styles.marginBottom}>
                        Skip
                    </TButtonOutlined>
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
    InfoText: {
        color: theme.colors.text,
    },
});
