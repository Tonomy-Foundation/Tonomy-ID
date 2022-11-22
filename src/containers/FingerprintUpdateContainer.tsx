import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import TButton from '../components/Tbutton';
import { TH1 } from '../components/THeadings';
import settings from '../settings';
import theme from '../utils/theme';

export default function CreateAccountContainer() {
    return (
        <View style={styles.container}>
            <View>
                <TH1 style={styles.headertext}>Would you like to add a fingerprint for added security?</TH1>
            </View>
            <View>
                <Text style={styles.description}>This is easier than using your PIN every time.</Text>
            </View>
            <View style={styles.imagewrapper}>
                <Image style={styles.image} source={require('../assets/images/fingerprint.png')}></Image>
            </View>
            <View style={styles.buttonwrapper}>
                <TButton style={styles.button} mode="contained">
                    Next
                </TButton>
                <TButton style={styles.button} mode="contained" color={settings.config.theme.secondaryColor}>
                    Skip
                </TButton>
            </View>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    buttonwrapper: {
        paddingTop: 20,
    },
    button: {
        margin: 10,
        alignSelf: 'center',
        width: '90%',
    },
    image: {
        marginTop: 50,
        alignSelf: 'center',
        width: 200,
        height: 200,
    },
    imagewrapper: {
        padding: 40,
        alignSelf: 'center',
    },
    description: {
        fontSize: 18,
        marginTop: 7,
        textAlign: 'center',
        alignSelf: 'center',
        color: theme.colors.disabled,
    },
    headertext: {
        fontSize: 30,
        marginTop: 20,
        paddingLeft: 20,
        textAlign: 'left',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: '800',
    },
    container: {
        flex: 1,
    },
});
