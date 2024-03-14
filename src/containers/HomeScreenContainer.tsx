import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { TButtonContained, TButtonOutlined, TButtonText } from '../components/atoms/TButton';
import LayoutComponent from '../components/layout';
import { TH1, TH4 } from '../components/atoms/THeadings';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import { Props } from '../screens/HomeScreen';
import { Images } from '../assets';

export default function HomeScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <LayoutComponent
            body={
                <View style={styles.header}>
                    {/* TODO uncomment link */}
                    {/* <TButtonText style={styles.headerButton}>Need Help?</TButtonText> */}
                    <View style={styles.imgContainer}>
                        <Image
                            style={[styles.logo, commonStyles.marginBottom]}
                            source={Images.GetImage('logo1024')}
                        ></Image>
                        <TH1 style={commonStyles.marginBottom}>{settings.config.appName}</TH1>

                        <TH4 style={[commonStyles.textAlignCenter]}>{settings.config.appSlogan}</TH4>
                    </View>
                </View>
            }
            footer={
                <View>
                    <TButtonContained onPress={() => navigation.navigate('Hcaptcha')} style={commonStyles.marginBottom}>
                        Create Account
                    </TButtonContained>
                    <TButtonOutlined
                        onPress={() => navigation.navigate('LoginUsername')}
                        style={commonStyles.marginBottom}
                    >
                        Login
                    </TButtonOutlined>
                </View>
            }
        ></LayoutComponent>
    );
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
    },
    link: {
        color: settings.config.theme.primaryColor,
        textDecorationLine: 'underline',
        fontSize: 14,
        fontWeight: '400',
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
        height: '40%',
        resizeMode: 'contain',
    },
});
