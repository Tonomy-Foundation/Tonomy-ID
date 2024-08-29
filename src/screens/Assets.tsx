import React from 'react';
import AssetsContainer from '../containers/AssetsContainer';
//import { RouteStackParamList } from '../navigation/BottomTabNavigator';
//import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

//export type AssetsScreenNavigationProp = BottomTabScreenProps<RouteStackParamList, 'Assets'>;
export type AssetsScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'Assets'>;

export default function Assets(props: AssetsScreenNavigationProp) {
    return <AssetsContainer did={props.route.params?.did} navigation={props.navigation}></AssetsContainer>;
}
