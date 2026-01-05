import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Props } from '../screens/ExistingTrinsicIdScreen';
import PhoneInputLib from 'react-native-phone-number-input';
import type { PhoneInputProps } from 'react-native-phone-number-input';
import { TButtonContained } from '../components/atoms/TButton';
import ProviderPicker from '../components/ProviderPicker';
import { isValidPhoneNumber } from 'libphonenumber-js';
import theme from '../utils/theme';

const PhoneInput = PhoneInputLib as unknown as React.ComponentType<PhoneInputProps>;

export type ExistingTrinsicIdProps = {
    navigation: Props['navigation'];
};

const ExistingTrinsicIdContainer = ({ navigation }: ExistingTrinsicIdProps) => {
    const [value, setValue] = useState('');
    const [formattedValue, setFormattedValue] = useState('');
    const [existing, setExisting] = useState(false);
    const isValid = isValidPhoneNumber(formattedValue);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.closeBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                >
                    <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>

                {existing ? (
                    <View style={styles.content}>
                        <Image source={require('../assets/tonomyProduction/logo48x48.png')} style={styles.logo} />

                        <Text style={styles.title}>Check for an existing ID</Text>
                        <Text style={styles.subtitle}>Enter your phone number to find your IDs</Text>

                        <View style={styles.phoneWrap}>
                            <PhoneInput
                                defaultValue={value}
                                defaultCode="NL"
                                layout="first"
                                onChangeText={setValue}
                                onChangeFormattedText={setFormattedValue}
                                withShadow={false}
                                withDarkTheme={false}
                                autoFocus
                                containerStyle={styles.pi_container}
                                flagButtonStyle={styles.pi_flagButton}
                                countryPickerButtonStyle={styles.pi_countryPickerBtn}
                                textContainerStyle={styles.pi_textContainer}
                                textInputStyle={styles.pi_textInput}
                                codeTextStyle={styles.pi_codeText}
                            />
                            <TButtonContained
                                style={{ width: '100%', marginTop: 30 }}
                                size="large"
                                onPress={() => {
                                    setExisting(!existing);
                                }}
                            >
                                Find my ID
                            </TButtonContained>
                            <Text style={styles.btnSubText}>Used only to check for an existing ID</Text>
                        </View>
                    </View>)
                    : (
                    <View style={styles.content}>
                            <Image
                                source={require("../assets/tonomyProduction/logo48x48.png")}
                                style={styles.logo}
                            />

                        <Text style={styles.title}>We found your existing IDs</Text>
                            <Text style={styles.subtitle}>
            Choose how you'd like to continue the login
                            </Text>
                        <ProviderPicker
                                onScanGovernmentId={() => {
                                    setExisting(!existing)
                            }}
                        />
                    </View>
                    )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },

    container: {
        flex: 1,
    },

    closeBtn: {
        position: 'absolute',
        top: 10,
        left: 12,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    closeText: {
        fontSize: 30,
        lineHeight: 28,
    },

    content: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 64,
        alignItems: 'center',
        marginTop: 40,
        width: '100%',
    },

    logo: {
        width: 56,
        height: 56,
        resizeMode: 'contain',
        marginBottom: 18,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 14,
        color: theme.colors.grey9,
        textAlign: 'center',
        marginBottom: 26,
    },

    phoneWrap: {
        width: '100%',
        maxWidth: 420,
    },
    pi_container: {
        width: '100%',
        height: 48,
        backgroundColor: 'transparent',
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        flexDirection: 'row',
        alignItems: 'center',
    },

    pi_flagButton: {
        width: 120,
        height: 48,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 10,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    pi_countryPickerBtn: {
        width: 50,
        height: 48,
    },

    pi_codeText: {
        fontSize: 14,
        marginLeft: 6,
    },

    // RIGHT box (phone number input)
    pi_textContainer: {
        flex: 1,
        height: 48,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 10,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },

    pi_textInput: {
        height: 48,
        fontSize: 14,
        paddingVertical: 0,
    },
    btnSubText: {
        marginTop: 10,
        fontSize: 13,
        color: theme.colors.grey9,
        textAlign: 'center',
    },
});

export default ExistingTrinsicIdContainer;
