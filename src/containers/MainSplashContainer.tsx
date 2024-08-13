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
import NetInfo from '@react-native-community/netinfo';
import { connect } from '../utils/StorageManager/setup';

export default function MainSplashScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    const errorStore = useErrorStore();
    const { user, initializeStatusFromStorage, getStatus, logout } = useUserStore();
    const initializeWallet = useWalletStore((state) => state.initializeWalletState);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            if (!state.isConnected) {
                navigation.dispatch(StackActions.replace('Home'));
            }
        });

        // Cleanup the event listener
        return () => unsubscribe();
    }, [navigation]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            if (!state.isConnected) {
                navigation.dispatch(StackActions.replace('Home'));
            }
        });

        // Cleanup the event listener
        return () => unsubscribe();
    }, [navigation]);

    useEffect(() => {
        async function main() {
            await sleep(800);

            try {
                await initializeStatusFromStorage();
                const status = getStatus();

                await connect();

                switch (status) {
                    case UserStatus.NONE:
                        navigation.dispatch(StackActions.replace('Home'));
                        break;
                    case UserStatus.NOT_LOGGED_IN:
                        navigation.dispatch(StackActions.replace('Home'));
                        break;
                    case UserStatus.LOGGED_IN:
                        try {
                            await user.getUsername();
                            await initializeWallet();
                        } catch (e) {
                            if (e instanceof SdkError && e.code === SdkErrors.InvalidData) {
                                logout("Invalid data in user's storage");
                            } else {
                                throw e;
                            }
                        }

                        break;
                    default:
                        throw new Error('Unknown status: ' + status);
                }
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            }
        }

        main();
    }, [errorStore, getStatus, initializeStatusFromStorage, logout, navigation, user, initializeWallet]);

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
