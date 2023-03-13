import React from 'react';
import { StyleSheet } from 'react-native';
import SplashScreenContainer from '../containers/SplashContainer';
import { NavigationProp } from '@react-navigation/native';
import settings from '../settings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SplashPrivacy'>;
export default function SplashPrivacyScreen(props: Props) {
    return (
        <SplashScreenContainer
            navigation={props.navigation}
            title="Privacy"
            subtitle="Only you control and see your personal information"
            imageSource={require('../assets/animations/privacy-policy.gif')}
            icon="privacy"
            description="Your personal info is stored only in your phone. It can only be viewed by people you share it with. Not even Tonomy or Telos can see it."
            linkUrl={settings.config.links.privacyLearnMore}
            linkUrlText="Learn More"
            buttonText="NEXT"
            buttonOnPress={() => props.navigation.navigate('SplashTransparency')}
        ></SplashScreenContainer>
    );
}
