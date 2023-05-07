import React from 'react';
import QrCodeScanContainer from '../containers/QrCodeScanContainer';
import { BarCodeScannerResult } from 'expo-barcode-scanner';

export type Props = {
    onClose?: () => void;
    onScan: (result: BarCodeScannerResult) => void;
};
export default function QrCodeScanScreen(props: Props) {
    return <QrCodeScanContainer {...props}></QrCodeScanContainer>;
}
