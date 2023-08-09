import React from 'react';
import SplashScreenContainer from '../containers/SplashContainer';
import settings from '../settings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SplashSecurity'>;

export default function SplashSecurityScreen(props: Props) {
    return (
        <SplashScreenContainer
            navigation={props.navigation}
            title="Security"
            subtitle="You are in control of your identity"
            imageSource={require('../assets/animations/security-splash.gif')}
            icon="security"
            description={`${settings.config.appName} secures all transactions and data by only storing keys and your data on your phone - nowhere else!`}
            linkUrl={settings.config.links.securityLearnMore}
            linkUrlText="Learn More"
            buttonText="NEXT"
            buttonOnPress={() => props.navigation.navigate('SplashPrivacy')}
        ></SplashScreenContainer>
    );
}
