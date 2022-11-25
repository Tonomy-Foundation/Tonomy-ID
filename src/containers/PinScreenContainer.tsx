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
            setConfirming(true);
        }
        setLoading(false);
    }

    return (
        <View style={styles.head}>
            <Text style={styles.header}>
                <TH1>{confirming ? 'Repeat your PIN' : 'Add a PIN'}</TH1>
            </Text>
            <Text style={styles.headdescription}>This helps keep your account secure</Text>
            <View>
                <HelperText type="error" visible={errorMessage !== ''}>
                    {errorMessage}
                </HelperText>
            </View>
            <TPin pin={pin} onChange={onPinChange}></TPin>
            <View style={styles.buttonwrapper}>
                <TButton onPress={() => navigation.navigate('fingerprint')} style={styles.skipbutton}>
                    Skip
                </TButton>
                <TButton disabled={disabled} loading={loading} onPress={onNext} style={styles.nextbutton}>
                    Next
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
    headdescription: {
        marginTop: 7,
        paddingLeft: '8%',
        textAlign: 'left',
        alignSelf: 'flex-start',
        color: theme.colors.disabled,
    },
    buttonwrapper: {
        marginTop: 20,
    },
    skipbutton: {
        marginBottom: 10,
        alignSelf: 'center',
        width: '90%',
        backgroundColor: settings.config.theme.primaryColor,
    },
    nextbutton: {
        marginBottom: 10,
        alignSelf: 'center',
        width: '90%',
        backgroundColor: settings.config.theme.primaryColor,
    },
});
function foreach(loop: number) {
    throw new Error('Function not implemented.');
}
