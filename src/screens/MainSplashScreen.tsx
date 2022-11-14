import React from 'react';
import { NavigationProp } from '@react-navigation/native';
import MainSplashScreenContainer from '../containers/MainSplashContainer';
import settings from '../settings';

export default function MainSplashScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return (
        <MainSplashScreenContainer
            imageSource={require('../assets/tonomy/tonomy-logo1024.png')}
        ></MainSplashScreenContainer>
    );
}
