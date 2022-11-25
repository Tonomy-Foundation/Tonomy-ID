import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import { TH1 } from '../components/THeadings';
import theme from '../utils/theme';
import { NavigationProp } from '@react-navigation/native';
import TPin from '../components/TPin';
import settings from '../settings';
import useUserStore from '../store/userStore';
import { HelperText } from 'react-native-paper';

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
        <View style={styles.head}>
            <Text style={styles.header}>
                <TH1>{confirming ? 'Repeat your PIN' : 'Add a PIN'}</TH1>
            </Text>
            <Text style={styles.headDescription}>This helps keep your account secure</Text>
            <View style={styles.centeredText}>
                <HelperText type="error" visible={errorMessage !== ''}>
                    {errorMessage}
                </HelperText>
            </View>
            <TPin pin={pin} onChange={onPinChange}></TPin>
            <View style={styles.buttonWrapper}>
                <TButton disabled={disabled} loading={loading} onPress={onNext} style={styles.nextButton}>
                    {confirming ? 'Confirm' : 'Next'}
                </TButton>
                <TButton onPress={() => navigation.navigate('fingerprint')} style={styles.skipButton}>
                    Skip
                </TButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    head: {
        flex: 1,
        display: 'flex',
        alignContent: 'center',
    },
    header: {
        marginTop: 20,
        paddingLeft: '8%',
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: '800',
        fontSize: 14,
    },
    headDescription: {
        marginTop: 7,
        paddingLeft: '8%',
        textAlign: 'left',
        alignSelf: 'flex-start',
        color: theme.colors.disabled,
    },
    centeredText: {
        alignItems: 'center',
    },
    buttonWrapper: {
        marginTop: 20,
    },
    skipButton: {
        marginBottom: 10,
        alignSelf: 'center',
        width: '90%',
        backgroundColor: settings.config.theme.secondaryColor,
    },
    nextButton: {
        marginBottom: 10,
        alignSelf: 'center',
        width: '90%',
        backgroundColor: settings.config.theme.primaryColor,
    },
});
