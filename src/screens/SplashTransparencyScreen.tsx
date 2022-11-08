import React from 'react';
import SplashScreenContainer from '../containers/SplashContainer';
import { NavigationProp } from '@react-navigation/native';
import settings from '../settings';

export default function SplashTransparencyScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return (
        <SplashScreenContainer
            navigation={navigation}
            title="Transparency"
            subtitle="This app is built and run in a transparent way"
            imageSource={require('../assets/images/transparency-splash.png')}
            icon="transparency"
            description="The software that runs Telos ID is open-source and can be reviewed and run by anyone. It is maintained by a Dutch non profit called the Tonomy Foundation that practices radical transarency."
            linkUrl={settings.config.links.transparencyLearnMore}
            linkUrlText="Learn More"
            buttonText="GET STARTED"
            buttonOnPress={() => navigation.navigate('home')}
        ></SplashScreenContainer>
    );
}
