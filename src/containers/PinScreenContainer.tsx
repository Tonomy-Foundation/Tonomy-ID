import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import { TH1 } from '../components/THeadings';
import theme from '../theme';

export default function PinScreenContainer() {
    return (
        <View style={styles.head}>
            <Text style={styles.header}>
                <TH1>Add a PIN</TH1>
            </Text>
            <Text style={styles.headdescription}>This helps keep your account secure</Text>
            {/* TODO use the pin circles here */}
            <View style={styles.grid}>
                <Text style={styles.griditem}>1</Text>
                <Text style={styles.griditem}>2</Text>
                <Text style={styles.griditem}>3</Text>
                <Text style={styles.griditem}>4</Text>
                <Text style={styles.griditem}>5</Text>
                <Text style={styles.griditem}>6</Text>
                <Text style={styles.griditem}>7</Text>
                <Text style={styles.griditem}>8</Text>
                <Text style={styles.griditem}>9</Text>
                <Text style={styles.griditem}>0</Text>
            </View>
            <View style={styles.buttonwrapper}>
                <TButton style={styles.button}>Next</TButton>
                <TButton style={styles.button}>Skip</TButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    griditem: {
        color: '#ffffff',
        borderColor: '#000000',
        borderWidth: 1,
        width: '30%',
        height: 100,
        fontSize: 30,
        textAlign: 'center',
    },
    grid: {
        backgroundColor: '#2196f3',
        width: '90%',
    },
    dot: {
        height: '25px',
        width: '25px',
        borderRadius: 50,
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
    button: {
        marginBottom: 10,
        alignSelf: 'center',
        width: '90%',
    },
});
