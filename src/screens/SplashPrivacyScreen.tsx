import React from 'react';
import SplashScreenContainer from '../containers/SplashContainer';
import { NavigationProp } from '@react-navigation/native';

export default function SplashPrivacyScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return (
        <SplashScreenContainer
            navigation={navigation}
            title="Privacy"
            subtitle="Only you control and see your personal information"
            imageUrl="./assets/privacy-splash.png"
            description="Your personal info is stored only in your phone. It can only be viewed by people you share it with. Not even Tonomy or Telos can see it."
            learnMoreUrl=""
            buttonText="NEXT"
            buttonOnPress={() => navigation.navigate('transparencySplash')}
        ></SplashScreenContainer >
    );
}