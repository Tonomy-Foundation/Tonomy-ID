import HomeScreenContainer from '../containers/HomeScreenContainer';
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Home'>;
export default function HomeScreen(props: Props) {
    return <HomeScreenContainer navigation={props.navigation}></HomeScreenContainer>;
}
