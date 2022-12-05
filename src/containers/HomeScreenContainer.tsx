import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { TButtonContained, TButtonOutlined, TButtonText } from '../components/atoms/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import LayoutComponent from '../components/layout';
import { TCaption, TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import { sleep } from '../utils/sleep';
import useErrorStore from '../store/errorStore';

export default function HomeScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const {
        colors: { text },
    } = useTheme();
    const stylesColor = StyleSheet.create({
        text: {
            color: text,
        },
    });

    useErrorStore().setError(new Error('Jacks new error error'));

    useEffect(() => {
        // throws unhandled promise rejection. not caught
        // throwUnhandledError();
        // throws a JSException. caught with setJSExceptionHandler
        // throw new Error('Unhandled error');
    }, []);

    return (
        <LayoutComponent
            body={
                <View style={styles.header}>
                    <TButtonText style={styles.headerButton}>Need Help?</TButtonText>
                    <View style={styles.imgContainer}>
                        <Image
                            style={[styles.logo, commonStyles.marginBottom]}
                            source={require('../assets/tonomy/tonomy-logo1024.png')}
                        ></Image>
                        <TH1 style={stylesColor.text}>{settings.config.appName}</TH1>

                        <TP size={2} style={[commonStyles.textAlignCenter, stylesColor.text]}>
                            {settings.config.appSlogan}
                        </TP>
                    </View>
                </View>
            }
            footer={
                <View>
                    <TButtonContained
                        onPress={() => navigation.navigate('createAccountUsername')}
                        style={commonStyles.marginBottom}
                    >
                        Create Account2222333
                    </TButtonContained>
                    <TButtonOutlined
                        onPress={() => navigation.navigate('fingerprint')}
                        style={commonStyles.marginBottom}
                    >
                        Login
                    </TButtonOutlined>
                    <TCaption style={commonStyles.textAlignCenter}>
                        By creating an account, you agree to our <TLink>Terms & Conditions</TLink> and agree to &nbsp;
                        <TLink>Privacy Policy</TLink>
                    </TCaption>
                </View>
            }
        ></LayoutComponent>
    );
}

async function throwUnhandledError() {
    await sleep(4000);
    throw new Error('Unhandled promise error');
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
    },
    headerButton: {
        alignSelf: 'flex-end',
    },
    imgContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    logo: {
        alignSelf: 'center',
        height: '50%',
        resizeMode: 'contain',
    },
});
