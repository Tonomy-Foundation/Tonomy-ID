import React from 'react';
import { RouteStackParamList } from '../navigation/BottomTabNavigator';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import ScanQRContainer from '../containers/ScanQRContainer';

export type ScanQRScreenProps = BottomTabScreenProps<RouteStackParamList, 'ScanQR'>;

export default function ScanQRScreen(props: ScanQRScreenProps) {
    return <ScanQRContainer navigation={props.navigation}></ScanQRContainer>;
}
