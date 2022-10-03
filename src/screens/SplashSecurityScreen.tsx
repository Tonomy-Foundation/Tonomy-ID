import React from 'react';
import { NavigationProp } from '@react-navigation/native';
import SplashScreen from '../containers/SplashContainer';

export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return (
        <SplashScreen></SplashScreen>
    );
}