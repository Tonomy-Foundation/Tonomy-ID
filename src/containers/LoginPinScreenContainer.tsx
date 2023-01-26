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
    /***
     * The Correct pin set 11111, it can be fetched and set of user from storage
     *
     * */
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
    /***
     *  Navigated to Create Finger Print Screen on Skip
     *
     * */
    function onSkip() {
        navigation.navigate('CreateAccountFingerprint');
    }
    /***
     * When the Next button is removed then it will be called when the 5 digits are entered
     *
     * */
    async function onNext() {
        setLoading(true);
        console.log(pin, confirmPin);
        /***
         *  Navigated to Create Finger Print Screen if the Pin is Correct
         *
         * */
        if (pin === confirmPin) {
            navigation.navigate('CreateAccountFingerprint');
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
