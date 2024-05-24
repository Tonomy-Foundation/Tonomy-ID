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
import settings from '../settings';
import { Images } from '../assets';
import { connect } from '../StorageManager/setup';

export default function MainSplashScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    const errorStore = useErrorStore();
    const { user, initializeStatusFromStorage, getStatus, logout } = useUserStore();

    useEffect(() => {
        async function initializeApp() {
            try {
                await connect();
            } catch (error) {
                console.log('Failed to initialize data source:', error);
            }
        }

        initializeApp();
    }, []);

    useEffect(() => {
        async function main() {
            await sleep(800);

            try {
                await initializeStatusFromStorage();
                const status = getStatus();

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
    }, [errorStore, getStatus, initializeStatusFromStorage, logout, navigation, user]);

    return (
        <LayoutComponent
            body={
                <View>
                    <Image style={styles.mainlogo} source={Images.GetImage('logo1024')}></Image>
                    <Image style={styles.tonomylogo} source={Images.GetImage('logo1024')}></Image>
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
