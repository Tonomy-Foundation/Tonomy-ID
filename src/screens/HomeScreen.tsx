import HomeScreenContainer from '../containers/HomeScreenContainer';
import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Home'>;
export default function HomeScreen(props: Props) {
    return <HomeScreenContainer navigation={props.navigation}></HomeScreenContainer>;
}
