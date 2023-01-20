import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import TTextInput from '../components/TTextInput';
import TPasswordInput from '../components/TPasswordInput';
import TLink from '../components/TA';
import { TH1 } from '../components/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

const getRandomPassword = (length = 16) => {
    return CryptoJS.lib.WordArray.random(length).toString();
};

export default function CreateAccountContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const onPasswordChange = () => {
        if (!showConfirmPassword) {
            setPassword('');
            setShowConfirmPassword(true);
        }
    };

    React.useEffect(() => {
        const password = getRandomPassword();
        setPassword(password);
    }, []);

    return (
        <View style={styles.container}>
            <View>
                <TH1>Create your username and password</TH1>
            </View>
            <View>
                <Text>Get started with your account on {settings.config.appName}</Text>
            </View>
            <View>
                <View style={styles.username}>
                    <TTextInput style={styles.usernameInput} label="Username" />
                    <Text style={styles.accountSuffix}>{settings.config.accountSuffix}</Text>
                </View>
                <TPasswordInput label="Password" onChangeText={onPasswordChange} value={password} />
                {showConfirmPassword && <TPasswordInput label="Confirm Password" />}
            </View>

            <View>
                <TButton onPress={() => navigation.navigate('fingerprint')}>Next</TButton>
            </View>
            <View>
                <Text>
                    Already have an account? <TLink>Login</TLink>
                </Text>
            </View>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    username: {
        flexDirection: 'row',
    },
    usernameInput: {
        width: '80%',
    },
    accountSuffix: {
        width: '20%',
    },
});
