import React from 'react';
import { NavigationProp } from '@react-navigation/native';
import MainSplashScreenContainer from '../containers/MainSplashContainer';
import settings from '../settings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Splash'>;
export default function MainSplashScreen(props: Props) {
    return <MainSplashScreenContainer navigation={props.navigation}></MainSplashScreenContainer>;
}
