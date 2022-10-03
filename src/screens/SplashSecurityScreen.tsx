import React from 'react';
import SplashScreenContainer from '../containers/SplashContainer';
import { NavigationProp } from '@react-navigation/native';

export default function SplashSecurityScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return (
        <SplashScreenContainer
            navigation={navigation}
            title="Security"
            subtitle="You are in control of your identity"
            imageUrl="./assets/security-splash.png"
            description="Tonomy secures all transactions and data by only storing keys and your data on your phone - nowhere else!"
            learnMoreUrl=""
            buttonText="NEXT"
            buttonOnPress={() => navigation.navigate('privacySplash')}
        ></SplashScreenContainer >
    );
}