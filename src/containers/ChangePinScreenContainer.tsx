/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import TButton, { TButtonContained } from '../components/atoms/Tbutton';
import { TH1 } from '../components/atoms/THeadings';
import TPin from '../components/TPin';
import useUserStore from '../store/userStore';
import { HelperText } from 'react-native-paper';
import LayoutComponent from '../components/layout';
import useErrorStore from '../store/errorStore';
import { Props } from '../screens/ChangePinScreen';
import theme, { commonStyles } from '../utils/theme';
import settings from '../settings';
import TInfoBox from '../components/TInfoBox';

export default function ChangePinScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [confirming, setConfirming] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [checked, setChecked] = useState(false);

    const user = useUserStore().user;
    const errorStore = useErrorStore();

    function onPinChange(pin: string) {
        setPin(pin);
        setDisabled(pin.length < 5);
        setErrorMessage('');
    }

    async function confirmAndSavePin() {
        setLoading(true);

        if (confirming) {
            if (pin === confirmPin) {
                try {
                    // await user.savePIN(confirmPin);
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

    async function checkPin() {
        // Logic for Checking pin
        // if correct then allow to enter and confirm then check  and update pin
        // else show error to enter correct pin
        setChecked(true);
    }

    return (
        <LayoutComponent
            body={
                <View style={styles.header}>
                    <View>
                        <TH1 style={commonStyles.marginTopTextCenter}>
                            {checked === false
                                ? 'Enter current PIN '
                                : confirming
                                    ? 'Repeat your PIN'
                                    : 'Create new Pin'}
                        </TH1>
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
                        mode="contained"
                        disabled={disabled}
                        loading={loading}
                        onPress={checked === false ? checkPin : confirmAndSavePin}
                        style={styles.marginBottom}
                    >
                        {confirming ? 'Confirm' : 'Next'}
                    </TButtonContained>
                    {!confirming && (
                        <TButtonContained
                            mode="outlined"
                            onPress={() => {
                                navigation.goBack();
                            }}
                            style={{ ...styles.marginBottom, borderColor: theme.colors.primary }}
                        >
                            Cancel
                        </TButtonContained>
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
