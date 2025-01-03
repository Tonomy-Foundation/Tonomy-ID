import React from 'react';
import MainSplashScreenContainer from '../containers/MainSplashContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Splash'>;

export default function MainSplashScreen(props: Props) {
    return <MainSplashScreenContainer navigation={props.navigation}></MainSplashScreenContainer>;
}
