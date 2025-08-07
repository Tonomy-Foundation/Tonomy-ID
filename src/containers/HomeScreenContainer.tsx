import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import LayoutComponent from '../components/layout';
import { TH1, TH4 } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import settings from '../settings';
import { Props } from '../screens/HomeScreen';
import { Images } from '../assets';
import TInfoModalBox from '../components/TInfoModalBox';

export default function HomeScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <LayoutComponent
            body={
                <View style={styles.header}>
                    {/* TODO: uncomment link */}
                    {/* <TButtonText style={styles.headerButton}>Need Help?</TButtonText> */}
                    <View style={styles.imgContainer}>
                        <Image style={styles.logo} source={Images.GetImage('home')}></Image>

                        <TH4 style={[styles.sloganText, commonStyles.textAlignCenter]}>{settings.config.appSlogan}</TH4>
                    </View>
                </View>
            }
            footerHint={
                <View style={{ marginTop: 30 }}>
                    <TButtonContained
                        size="large"
                        onPress={() => navigation.navigate('CreateAccountUsername')}
                        style={commonStyles.marginBottom}
                    >
                        Create Account
                    </TButtonContained>
                    <TButtonOutlined
                        size="large"
                        onPress={() => navigation.navigate('LoginUsername')}
                        style={commonStyles.marginBottom}
                    >
                        Login
                    </TButtonOutlined>
                </View>
            }
            footer={
                <View style={{ marginTop: 30 }}>
                    <TInfoModalBox
                        description="Your personal data is stored ONLY on your phone. Not in databases, "
                        modalTitle="Your Data Stays Private and Secure"
                        modalDescription="Your data, your rules. Privacy isn’t a feature — it’s your right. That’s why your personal information stays on your phone, and nowhere else. No cloud. No servers. No third parties. Which means it can’t be leaked, hacked, or sold — because we never store it in the first place. You’re always in control. This is privacy by design, not just a promise."
                    />
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
        justifyContent: 'center',
    },
    logo: {
        alignSelf: 'center',
        height: '40%',
        resizeMode: 'contain',
    },
    sloganText: {
        color: theme.colors.black,
        fontWeight: '600',
        fontSize: 15,
        marginTop: 10,
    },
});
