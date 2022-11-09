import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { TouchableOpacity } from 'react-native';
import TButton from '../components/Tbutton';
import { TH1 } from '../components/THeadings';
import theme from '../utils/theme';
import { NavigationProp } from '@react-navigation/native';

export default function PinScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const [pin, setPin] = useState('');
    function onNumberPress(num: string) {
        setPin((pin) => pin + num);
    }

    return (
        <View style={styles.head}>
            <Text style={styles.header}>
                <TH1>Add a PIN</TH1>
            </Text>
            <Text style={styles.headdescription}>This helps keep your account secure</Text>
            <View style={styles.dotcontainer}>
                <View style={styles.dot}>
                    <Text></Text>
                </View>
                <View style={styles.dot}></View>
                <View style={styles.dot}></View>
                <View style={styles.dot}></View>
                <View style={styles.dot}></View>
            </View>
            <View style={styles.grid}>
                <TouchableOpacity onPress={() => onNumberPress('1')} style={styles.griditem}>
                    <Text style={styles.griditem}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onNumberPress('2')} style={styles.griditem}>
                    <Text style={styles.griditem}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.griditem}>
                    <Text style={styles.griditem}>3</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.griditem}>
                    <Text style={styles.griditem}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.griditem}>
                    <Text style={styles.griditem}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.griditem}>
                    <Text style={styles.griditem}>6</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.griditem}>
                    <Text style={styles.griditem}>7</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.griditem}>
                    <Text style={styles.griditem}>8</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.griditem}>
                    <Text style={styles.griditem}>9</Text>
                </TouchableOpacity>
                <Text style={styles.griditem}></Text>
                <TouchableOpacity style={styles.griditem}>
                    <Text style={styles.griditem}>0</Text>
                </TouchableOpacity>
                <Text style={styles.griditem}></Text>
            </View>
            <View style={styles.buttonwrapper}>
                <TButton onPress={() => navigation.navigate('fingerprint')} style={styles.nextbutton}>
                    Next
                </TButton>
                <TButton onPress={() => navigation.navigate('fingerprint')} style={styles.skipbutton}>
                    Skip
                </TButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    griditem: {
        paddingTop: 20,
        width: '33%',
        height: 90,
        fontSize: 35,
        // Color: '#000000',
        textAlign: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        alignContent: 'center',
    },
    grid: {
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '90%',
    },
    dotcontainer: {
        alignContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dot: {
        margin: 10,
        marginTop: 20,
        marginBottom: 20,
        height: 20,
        width: 20,
        borderRadius: 1000,
        backgroundColor: theme.colors.disabled,
    },
    head: {
        flex: 1,
        display: 'flex',
        alignContent: 'center',
    },
    header: {
        marginTop: 20,
        textAlign: 'center',
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: '800',
        fontSize: 14,
    },
    headdescription: {
        marginTop: 7,
        textAlign: 'center',
        alignSelf: 'center',
        color: theme.colors.disabled,
    },
    buttonwrapper: {
        marginTop: 20,
    },
    skipbutton: {
        marginBottom: 10,
        alignSelf: 'center',
        width: '90%',
    },
    nextbutton: {
        marginBottom: 10,
        alignSelf: 'center',
        width: '90%',
        backgroundColor: theme.colors.disabled,
    },
});
