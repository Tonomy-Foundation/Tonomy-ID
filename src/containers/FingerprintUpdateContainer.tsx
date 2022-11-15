import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import TButton from '../components/Tbutton';
import { TH1 } from '../components/THeadings';
import settings from '../settings';

export default function CreateAccountContainer() {
    return (
        <View style={styles.container}>
            <View>
                <TH1>Would you like to add a fingerprint for added security?</TH1>
            </View>
            <View>
                <Text>This is easier than using your PIN every time</Text>
            </View>
            <Image source={require('../assets/images/fingerprint.png')}></Image>

            <View>
                <TButton mode="contained">Next</TButton>
                <TButton mode="contained" color={settings.config.theme.secondaryColor}>
                    Skip
                </TButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
