import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import theme from '../utils/theme';
import { NavigationProp, StackActions } from '@react-navigation/native';
import Storage from '../utils/storage';
import LayoutComponent from '../components/layout';
import { sleep } from '../utils/sleep';
import useErrorStore from '../store/errorStore';

export default function MainSplashScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const errorStore = useErrorStore();

    async function main() {
        await sleep(800);

        try {
            const storage = new Storage();
            const value = await storage.retrieve('newUser');
            const page = value ? 'login-register' : 'securitySplash';
            // this will prevent use from going back to this screen after the user navigated
            navigation.dispatch(StackActions.replace(page));
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    useEffect(() => {
        main();
    }, []);

    return (
        <LayoutComponent
            body={
                <View>
                    <Image style={styles.mainlogo} source={require('../assets/tonomy/tonomy-logo1024.png')}></Image>
                    <Image style={styles.tonomylogo} source={require('../assets/tonomy/tonomy-logo1024.png')}></Image>
                    <Text style={styles.text}>Brought to you by the Tonomy Foundation</Text>
                </View>
            }
        />
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
