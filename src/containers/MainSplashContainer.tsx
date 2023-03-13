import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import theme from '../utils/theme';
import { NavigationProp, StackActions } from '@react-navigation/native';
import LayoutComponent from '../components/layout';
import { sleep } from '../utils/sleep';
import useErrorStore from '../store/errorStore';
import useUserStore, { UserStatus } from '../store/userStore';

export default function MainSplashScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const errorStore = useErrorStore();
    const { user, initializeStatusFromStorage, getStatus, setStatus } = useUserStore();

    const userLogout = () => {
        user.logout();
        setStatus(UserStatus.NOT_LOGGED_IN);

        navigation.dispatch(StackActions.replace('Home'));
    };
    const checkKeys = async () => {
        await sleep(800);

        try {
            await user.checkKeysStillValid();
        } catch (e) {
            if (e.code === 'KeyNotFound') {
                user.logout();
                errorStore.setError({
                    error: e,
                    expected: false,
                    title: 'tst',
                });
                return;
            }
        }
    };

    async function main() {
        await sleep(800);

        const username = await user.storage.username;
        const userStatus = await user.getStatus();

        if (userStatus === 'READY' && UserStatus.LOGGED_IN) {
            await checkKeys();
            // if (!getKeyExists()) userLogout();
        }

        try {
            await initializeStatusFromStorage();
            const status = getStatus();

            switch (status) {
                case UserStatus.NONE:
                    navigation.dispatch(StackActions.replace('SplashSecurity'));
                    break;
                case UserStatus.NOT_LOGGED_IN:
                    userLogout();
                    break;
                case UserStatus.LOGGED_IN:
                    if (!username?.username) {
                        userLogout();
                    }

                    // if (user.getKeyExists)
                    break;
                default:
                    throw new Error('Unknown status: ' + status);
            }
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
