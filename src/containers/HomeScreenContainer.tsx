import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { TButtonContained, TButtonOutlined, TButtonText } from '../components/atoms/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import LayoutComponent from '../components/layout';
import { TCaption, TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import { Props } from '../screens/homeScreen';

export default function HomeScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    const {
        colors: { text },
    } = useTheme();
    const stylesColor = StyleSheet.create({
        text: {
            color: text,
        },
    });

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
                        onPress={() => navigation.navigate('CreateAccountUsername')}
                        style={commonStyles.marginBottom}
                    >
                        Create Account
                    </TButtonContained>
                    <TButtonOutlined
                        onPress={() => navigation.navigate('LoginUsername')}
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
