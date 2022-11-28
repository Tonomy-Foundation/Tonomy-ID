import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/atoms/Tbutton';
import { TH1 } from '../components/atoms/THeadings';
import { NavigationProp } from '@react-navigation/native';
import TPin from '../components/TPin';
import useUserStore from '../store/userStore';
import { HelperText } from 'react-native-paper';
import LayoutComponent from '../components/layout';

export default function PinScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const [confirming, setConfirming] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const user = useUserStore().user;

    function onPinChange(pin: string) {
        setPin(pin);
        setDisabled(pin.length < 5);
        setErrorMessage('');
    }

    async function onNext() {
        setLoading(true);
        if (confirming) {
            if (pin === confirmPin) {
                await user.savePIN(pin);
                navigation.navigate('fingerprint');
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
                            onPress={() => navigation.navigate('fingerprint')}
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
