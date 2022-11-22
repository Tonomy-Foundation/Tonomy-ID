import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import { TH1 } from '../components/THeadings';
import theme from '../utils/theme';
import { NavigationProp } from '@react-navigation/native';
import TPin from '../components/TPin';
import settings from '../settings';

export default function PinScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const [pin, setPin] = useState('');
    return (
        <View style={styles.head}>
            <Text style={styles.header}>
                <TH1>Add a PIN</TH1>
            </Text>
            <Text style={styles.headdescription}>This helps keep your account secure</Text>
            <TPin onPin={setPin}></TPin>
            <View style={styles.buttonwrapper}>
                <TButton onPress={() => navigation.navigate('fingerprint')} style={styles.skipbutton}>
                    Skip
                </TButton>
                <TButton
                    disabled={pin.length < 5}
                    onPress={() => navigation.navigate('fingerprint')}
                    style={styles.nextbutton}
                >
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
