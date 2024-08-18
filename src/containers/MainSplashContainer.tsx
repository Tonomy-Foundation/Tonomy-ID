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
import NetInfo from '@react-native-community/netinfo';

export default function MainSplashScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    const errorStore = useErrorStore();
    const { user, initializeStatusFromStorage, getStatus, logout } = useUserStore();
    const { clearState, initializeWalletState } = useWalletStore();

    useEffect(() => {
        async function main() {
            await sleep(800);
            const state = await NetInfo.fetch();

            try {
                await initializeStatusFromStorage();
                const status = getStatus();

                await connect();

                switch (status) {
                    case UserStatus.NONE:
                        navigation.dispatch(StackActions.replace('SplashSecurity'));
                        break;
                    case UserStatus.NOT_LOGGED_IN:
                        navigation.dispatch(StackActions.replace('Home'));
                        break;
                    case UserStatus.LOGGED_IN:
                        try {
                            await user.getUsername();

                            if (state.isConnected) {
                                await initializeWalletState();
                            } else {
                                // Keep checking until the connection is established
                                const interval = setInterval(async () => {
                                    if (state.isConnected) {
                                        clearInterval(interval);
                                        await initializeWalletState();
                                    }
                                }, 30000);
                            }
                        } catch (e) {
                            if (e instanceof SdkError && e.code === SdkErrors.InvalidData) {
                                logout("Invalid data in user's storage");
                                clearState();
                            } else {
                                throw e;
                            }
                        }

                        break;
                    default:
                        throw new Error('Unknown status: ' + status);
                }
            } catch (e) {
                if (state.isConnected) {
                    errorStore.setError({ error: e, expected: false });
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
