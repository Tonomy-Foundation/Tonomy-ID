import React from 'react';
import QrCodeScanContainer from '../containers/QrCodeScanContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type QrCodeScanScreenProps = NativeStackScreenProps<RouteStackParamList, 'CreateAccountFingerprint'>;

export default function QrCodeScanScreen(props: QrCodeScanScreenProps) {
    return <QrCodeScanContainer></QrCodeScanContainer>;
}
