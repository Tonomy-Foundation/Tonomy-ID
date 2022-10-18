import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import TTextInput from '../components/TTextInput';
import TPasswordInput from '../components/TPasswordInput';

export default function CreateAccountcontainer() {
    return (
        <View>
            <View style={styles.container}>
                <View style={styles.TextInputSizing}>
                    <TTextInput label="username" />
                    <TPasswordInput label="Password" />
                    <TPasswordInput label="Confirm Password" />
                </View>

                <View>
                    <TButton>Create Account</TButton>
                </View>
                <View>
                    <Text>Already have an account? Login</Text>
                </View>

                <StatusBar style="auto" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 220,
        marginTop: 50,
    },

    TextInputSizing: {
        width: 340,
        height: 50,
    },
});
