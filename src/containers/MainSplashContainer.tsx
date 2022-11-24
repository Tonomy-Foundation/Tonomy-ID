import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, ImageSourcePropType } from 'react-native';
import theme from '../utils/theme';
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import Storage from '../utils/storage';

export default function MainSplashScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const user = useUserStore();
    useEffect(() => {
        setTimeout(async () => {
            const storage = new Storage();
            const value = await storage.retrieve('newUser');
            // this will prevent use from going back to this screen after the user navigated
            value ? navigation.dispatch(StackActions.replace('home')) : navigation.navigate('securitySplash');
        }, 300);
    }, []);
    return (
        <View>
            <Image style={styles.mainlogo} source={require('../assets/tonomy/tonomy-logo1024.png')}></Image>
            <Image style={styles.tonomylogo} source={require('../assets/tonomy/tonomy-logo1024.png')}></Image>
            <Text style={styles.text}>Brought to you by the Tonomy Foundation</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    mainlogo: {
        margin: 180,
        alignSelf: 'center',
        width: 220,
        height: 220,
    },
    tonomylogo: {
        margin: 10,
        alignSelf: 'center',
        width: 40,
        height: 40,
    },
    text: {
        marginTop: 7,
        textAlign: 'center',
        alignSelf: 'center',
        color: theme.colors.disabled,
    },
});
