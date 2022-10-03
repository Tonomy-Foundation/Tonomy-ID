import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';

export default function CreateAccountcontainer({ navigation }: { navigation: NavigationProp<any> }) {
    return (
        <View style={styles.container}>
            <View>
                <Text><h1>Security</h1></Text>
            </View>
            <View>
                <Text>You are in control of your identity</Text>
            </View>
            <View>
                <Image source={require("./assets/security-splash.png")}></Image>
            </View>
            <View>
                <Text>Tonomy secures all transactions and data by only storing keys and your data on your phone - nowhere else!</Text>
            </View>
            <View>
                <Text><a href="">Learn more</a></Text>
            </View>
            <View>
                <TButton onPress={() => navigation.navigate('home')}>NEXT</TButton>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#fff',
        // alignItems: 'center',
        // justifyContent: 'center',
    },
});
