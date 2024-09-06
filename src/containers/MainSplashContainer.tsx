import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import theme from '../utils/theme';
import { StackActions } from '@react-navigation/native';
import LayoutComponent from '../components/layout';
import { sleep } from '../utils/sleep';
import useErrorStore from '../store/errorStore';
import useUserStore, { UserStatus } from '../store/userStore';
import { SdkError, SdkErrors, STORAGE_NAMESPACE } from '@tonomy/tonomy-id-sdk';
import { Props } from '../screens/MainSplashScreen';
import { Images } from '../assets';
import useWalletStore from '../store/useWalletStore';
import { connect } from '../utils/StorageManager/setup';
import Debug from 'debug';
import AsyncStorage from '@react-native-async-storage/async-storage';

const debug = Debug('tonomy-id:container:mainSplashScreen');

export default function MainSplashScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    const errorStore = useErrorStore();
    const { user, status, initializeStatusFromStorage, isAppInitialized, getStatus, logout, setStatus } =
        useUserStore();
    const { clearState, initializeWalletState } = useWalletStore();

    debug('user status splash screen', status);

    useEffect(() => {
        async function main() {
            await sleep(800);

            try {
                if (!isAppInitialized) {
                    let retryInterval = 10000; // Start with 10 seconds
                    const maxInterval = 3600000; // Cap at 1 hour

                    while (!isAppInitialized) {
                        try {
                            await initializeStatusFromStorage();
                            break;
                        } catch (error) {
                            if (error.message === 'Network request failed') {
                                debug('Network error occurred, retrying in', retryInterval / 1000, 'seconds');
                                await new Promise((resolve) => setTimeout(resolve, retryInterval));
                                retryInterval = Math.min(retryInterval * 2, maxInterval); // Double the interval, cap at 1 hour
                            } else {
                                break;
                            }
                        }
                    }
                }

                await connect();
                const status = getStatus();

                debug('splash screen status: ', status);

                switch (status) {
                    case UserStatus.NONE:
                        debug('status is NONE');
                        navigation.navigate('SplashSecurity');
                        break;
                    case UserStatus.NOT_LOGGED_IN:
                        debug('status is NOT_LOGGED_IN');
                        navigation.dispatch(StackActions.replace('Home'));
                        break;
                    case UserStatus.LOGGED_IN:
                        debug('status is LOGGED_IN');

                        try {
                            await user.getUsername();
                            await initializeWalletState();
                        } catch (e) {
                            if (e instanceof SdkError && e.code === SdkErrors.InvalidData) {
                                logout("Invalid data in user's storage");
                                clearState();
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
                console.error('main screen error', e);
                errorStore.setError({ error: e, expected: false });
            }
        }

        main();
    }, [
        errorStore,
        getStatus,
        initializeStatusFromStorage,
        logout,
        navigation,
        user,
        initializeWalletState,
        clearState,
        setStatus,
        isAppInitialized,
    ]);

    return (
        <LayoutComponent
            body={
                <View>
                    <Image style={styles.mainlogo} source={Images.GetImage('logo1024')} />
                    <Image style={styles.tonomylogo} source={Images.GetImage('logo1024')} />
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
