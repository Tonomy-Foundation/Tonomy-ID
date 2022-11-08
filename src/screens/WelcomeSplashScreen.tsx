import React from 'react';
import WelcomeSplashScreenContainer from '../containers/WelcomeSplashScreenContainer';
import { NavigationProp } from '@react-navigation/native';

export default function WelcomeSplashScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <WelcomeSplashScreenContainer navigation={navigation}></WelcomeSplashScreenContainer>;
}
