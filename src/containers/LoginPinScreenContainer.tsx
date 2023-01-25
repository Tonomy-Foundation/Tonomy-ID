import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton, { TButtonOutlined } from '../components/atoms/Tbutton';
import { TH1 } from '../components/atoms/THeadings';
import TPin from '../components/TPin';
import useUserStore from '../store/userStore';
import { HelperText } from 'react-native-paper';
import LayoutComponent from '../components/layout';
import useErrorStore from '../store/errorStore';
import { Props } from '../screens/FingerprintUpdateScreen';
import theme from '../utils/theme';
export default function LoginPinScreenContainer({
    navigation,
    password,
}: {
    navigation: Props['navigation'];
    password: string;
}) {
    const [disabled, setDisabled] = useState(true);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('11111');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const user = useUserStore().user;
    const errorStore = useErrorStore();

    function onPinChange(pin: string) {
        setPin(pin);
        setDisabled(pin.length < 5);
        setErrorMessage('');
    }
    function onSkip() {
        navigation.navigate('UserHome');
    }
    async function onNext() {
        setLoading(true);
        console.log(pin, confirmPin);
        if (pin === confirmPin) {
            alert('User Will be On New Screen');
            navigation.navigate('UserHome');
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
                    <TButton
                        mode="contained"
                        disabled={disabled}
                        loading={loading}
                        onPress={onNext}
                        style={styles.marginBottom}
                    >
                        {'Next'}
                    </TButton>
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
        color: theme.colors.placeholder,
    },
});
