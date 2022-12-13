import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/atoms/Tbutton';
import { TH1 } from '../components/atoms/THeadings';
import { NavigationProp } from '@react-navigation/native';
import TPin from '../components/TPin';
import useUserStore from '../store/userStore';
import { HelperText } from 'react-native-paper';
import LayoutComponent from '../components/layout';
import useErrorStore from '../store/errorStore';

export default function PinScreenContainer({
    navigation,
    password,
}: {
    navigation: NavigationProp<any>;
    password: string;
}) {
    const [confirming, setConfirming] = useState(false);
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

    async function onNext() {
        setLoading(true);
        if (confirming) {
            if (pin === confirmPin) {
                console.log('saving pin');
                try {
                    await user.savePIN(pin);
                } catch (e) {
                    console.log('error saving pin', e);
                    errorStore.setError({ error: e, expected: false });
                    setLoading(false);
                    return;
                }
                console.log('pin saved');
                navigation.navigate('CreateAccountFingerprint', { password });
            } else {
                setErrorMessage('PINs do not match');
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
                        <TH1>{confirming ? 'Repeat your PIN' : 'Add a PIN'}</TH1>
                    </View>
                    <View>
                        <Text>This helps keep your account secure</Text>
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
                    <TButton
                        mode="contained"
                        disabled={disabled}
                        loading={loading}
                        onPress={onNext}
                        style={styles.marginBottom}
                    >
                        {confirming ? 'Confirm' : 'Next'}
                    </TButton>
                    {!confirming && (
                        <TButton
                            mode="outlined"
                            onPress={() => navigation.navigate('CreateAccountFingerprint', { password })}
                            style={styles.marginBottom}
                        >
                            Skip
                        </TButton>
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
    },
});
