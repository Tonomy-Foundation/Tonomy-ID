import React from 'react';
import { RouteStackParamList } from '../navigation/Root';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import ScanQRContainer from '../containers/ScanQRContainer';

export type ScanQRScreenProps = BottomTabScreenProps<RouteStackParamList, 'ScanQR'>;

export default function ScanQRScreen(props: ScanQRScreenProps) {
    return <ScanQRContainer did={props.route.params?.did} navigation={props.navigation}></ScanQRContainer>;
}
