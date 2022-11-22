import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import { TH1 } from '../components/THeadings';
import settings from '../settings';
import theme from '../utils/theme';
import FingerprintIcon from '../assets/icons/FingerprintIcon';
import LayoutComponent from '../components/layout';

export default function CreateAccountContainer() {
    return (
        <LayoutComponent
            body={
                <View>
                    <View>
                        <TH1 style={styles.headertext}>Would you like to add a fingerprint for added security?</TH1>
                    </View>
                    <View>
                        <Text style={styles.description}>This is easier than using your PIN every time.</Text>
                    </View>
                    <View style={styles.container}>
                        <View style={styles.imagewrapper}>
                            <FingerprintIcon style={styles.image}></FingerprintIcon>
                        </View>
                    </View>
                </View>
            }
            footer={
                <View>
                    <TButton style={styles.button} mode="contained">
                        Next
                    </TButton>
                    <TButton style={styles.button} mode="contained" color={settings.config.theme.secondaryColor}>
                        Skip
                    </TButton>
                </View>
            }
        ></LayoutComponent>
    );
}

const styles = StyleSheet.create({
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
        paddingLeft: -20,
        textAlign: 'left',

        color: theme.colors.disabled,
    },
    headertext: {
        fontSize: 30,
        marginTop: 40,
        textAlign: 'left',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: '800',
    },
    container: {
        flex: 1,
    },
});
