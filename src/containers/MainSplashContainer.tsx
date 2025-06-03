import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import theme from '../utils/theme';
import { StackActions } from '@react-navigation/native';
import LayoutComponent from '../components/layout';
import { sleep } from '../utils/time';
import useErrorStore from '../store/errorStore';
import useUserStore, { UserStatus } from '../store/userStore';
import { isErrorCode, SdkErrors } from '@tonomy/tonomy-id-sdk';
import { Props } from '../screens/MainSplashScreen';
import { Images } from '../assets';
import { appStorage } from '../utils/StorageManager/setup';
import { useFonts } from 'expo-font';
import Debug from 'debug';
import { progressiveRetryOnNetworkError } from '../utils/network';

const debug = Debug('tonomy-id:container:mainSplashScreen');

export default function MainSplashScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    const errorStore = useErrorStore();
    const { user, initializeStatusFromStorage, isAppInitialized, getStatus, logout, setStatus } = useUserStore();

    useFonts({
        Roboto: require('../assets/fonts/Roboto-Regular.ttf'),
        Inter: require('../assets/fonts/Inter.ttf'),
    });

    useEffect(() => {
        async function main() {
            await sleep(800);

            try {
                if (!isAppInitialized) {
                    progressiveRetryOnNetworkError(initializeStatusFromStorage);
                }

                const status = await getStatus();

                debug('splash screen status: ', status);

                switch (status) {
                    case UserStatus.NONE:
                        navigation.navigate('Onboarding');
                        break;
                    case UserStatus.NOT_LOGGED_IN:
                        debug('status is NOT_LOGGED_IN');

                        {
                            const haveOnboarding = await appStorage.getSplashOnboarding();

                            if (haveOnboarding) {
                                navigation.navigate('Onboarding');
                            } else {
                                navigation.dispatch(StackActions.replace('Home'));
                            }
                        }

                        break;
                    case UserStatus.LOGGED_IN:
                        try {
                            await user.getUsername();
                        } catch (e) {
                            if (isErrorCode(e, SdkErrors.InvalidData)) {
                                logout("Invalid data in user's storage");
                            } else {
                                debug('loggedin error', e);
                                throw e;
                            }
                        }

                        break;
                    default:
                        throw new Error('Unknown status: ' + status);
                }
            } catch (e) {
                debug('main screen error', e);
                errorStore.setError({ error: e, expected: false });
                navigation.navigate('Onboarding');
            }
        }

        main();
    }, [errorStore, getStatus, initializeStatusFromStorage, logout, navigation, user, setStatus, isAppInitialized]);

    return (
        <LayoutComponent
            body={
                <View>
                    <Image style={styles.mainlogo} source={Images.GetImage('logo1024')} />
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
    text: {
        marginTop: 35,
        textAlign: 'center',
        alignSelf: 'center',
        color: theme.colors.disabled,
    },
});
