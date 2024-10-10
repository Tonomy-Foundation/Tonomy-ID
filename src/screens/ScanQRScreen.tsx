import React from 'react';
import { RouteStackParamList } from '../navigation/Root';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import ScanQRCodeContainer from '../containers/ScanQRCodeContainer';

export type ScanQRScreenProps = BottomTabScreenProps<RouteStackParamList, 'ScanQR'>;

export default function ScanQRScreen(props: ScanQRScreenProps) {
    return <ScanQRCodeContainer did={props.route.params?.did} navigation={props.navigation}></ScanQRCodeContainer>;
}
