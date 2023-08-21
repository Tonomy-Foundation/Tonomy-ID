import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import HcaptchaView from '@hcaptcha/react-native-hcaptcha';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const CaptchaScreen: React.FC = () => {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const handleCaptchaVerify = (token: string) => {
        // This function is called when the user successfully completes the captcha.
        // You can use the 'token' to verify the user's humanity on the server side.
        setCaptchaToken(token);
    };

    return (
        <View style={styles.container}>
            <Text>Complete the hCaptcha challenge to prove you're human:</Text>
            <HcaptchaView onVerify={handleCaptchaVerify} siteKey="10000000-ffff-ffff-ffff-000000000001" />
            <Button
                title="I am human"
                onPress={() => {
                    // Handle the user's action here (e.g., submit a form).
                    // Only proceed if the captcha has been successfully completed.
                    if (captchaToken) {
                        // Implement your action here.
                        console.log('User is verified and action can be performed.');
                    } else {
                        console.log('Captcha challenge not completed yet.');
                    }
                }}
            />
        </View>
    );
};

export default CaptchaScreen;
