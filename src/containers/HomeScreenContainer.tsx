import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { TButtonContained, TButtonOutlined, TButtonText } from '../components/atoms/Tbutton';
import LayoutComponent from '../components/layout';
import { TH1, TH4 } from '../components/atoms/THeadings';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import { Props } from '../screens/HomeScreen';

export default function HomeScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
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
                        <TH1 style={commonStyles.marginBottom}>{settings.config.appName}</TH1>

                        <TH4 style={[commonStyles.textAlignCenter]}>{settings.config.appSlogan}</TH4>
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
                    <Text style={commonStyles.textAlignCenter}>
                        By creating an account, you agree to our{' '}
                        <Text style={styles.link} onPress={() => navigation.navigate('TermsAndCondition')}>
                            Terms & Conditions{' '}
                        </Text>
                        and agree to{' '}
                        <Text style={styles.link} onPress={() => navigation.navigate('PrivacyAndPolicy')}>
                            Privacy Policy
                        </Text>
                    </Text>
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
