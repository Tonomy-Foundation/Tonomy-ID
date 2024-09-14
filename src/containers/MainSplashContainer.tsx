import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import theme from '../utils/theme';
import { StackActions } from '@react-navigation/native';
import LayoutComponent from '../components/layout';
import { sleep } from '../utils/sleep';
import useErrorStore from '../store/errorStore';
import useUserStore, { UserStatus } from '../store/userStore';
import { SdkError, SdkErrors } from '@tonomy/tonomy-id-sdk';
import { Props } from '../screens/MainSplashScreen';
import { Images } from '../assets';
import useWalletStore from '../store/useWalletStore';
import { connect } from '../utils/StorageManager/setup';
import Debug from 'debug';
import { progressiveRetryOnNetworkError } from '../utils/helper';

const debug = Debug('tonomy-id:container:mainSplashScreen');

export default function MainSplashScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    const errorStore = useErrorStore();
    const { user, initializeStatusFromStorage, isAppInitialized, getStatus, logout, setStatus } = useUserStore();
    const { clearState, initializeWalletState, initializeWalletAccount, initialized, accountExists } = useWalletStore();

    useEffect(() => {
        async function main() {
            await sleep(800);

            try {
                if (!isAppInitialized) {
                    try {
                        progressiveRetryOnNetworkError(async () => await initializeStatusFromStorage());
                    } catch (e) {
                        console.error('Error initializing app:', e);
                        errorStore.setError({ error: e, expected: false });
                    }
                }

                await connect();
                const status = await getStatus();

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

                            if (!initialized && accountExists) {
                                try {
                                    progressiveRetryOnNetworkError(async () => await initializeWalletState());
                                } catch (e) {
                                    console.error('Error initializing wallet:', e);
                                    errorStore.setError({ error: e, expected: false });
                                }
                            }
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
                if (e.message === 'Network request failed') {
                    debug('Network error occurred. Retrying...');
                } else {
                    debug('main screen error', e);
                    errorStore.setError({ error: e, expected: false });
                    navigation.navigate('SplashSecurity');
                }
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
        initializeWalletAccount,
        initialized,
        accountExists,
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
