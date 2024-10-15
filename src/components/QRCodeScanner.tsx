import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import FlashOnIcon from '../assets/icons/FlashIcon';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { Camera, FlashMode } from 'expo-camera';
import { ActivityIndicator } from 'react-native-paper';
import { TP } from './atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import QrScannerBorders from '../assets/images/QrScannerBorders';

type FlashToggleProps = {
    isFlashlightOn: boolean;
    onPress: () => void;
};

export const FlashToggleButton = ({ isFlashlightOn, onPress }: FlashToggleProps) => {
    return (
        <TouchableOpacity style={[styles.flashButton, isFlashlightOn && styles.flashOnButton]} onPress={onPress}>
            <FlashOnIcon color="white" />
        </TouchableOpacity>
    );
};

type CameraProps = {
    onBarCodeScanned: (result: BarCodeScannerResult) => void;
    isFlashlightOn: boolean;
};

export const CameraView = ({ onBarCodeScanned, isFlashlightOn }: CameraProps) => {
    return (
        <Camera
            flashMode={isFlashlightOn ? FlashMode.torch : FlashMode.off}
            barCodeScannerSettings={{
                barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
            }}
            onBarCodeScanned={onBarCodeScanned}
            style={StyleSheet.absoluteFill}
        />
    );
};

type PermissionProps = {
    hasPermission: boolean | null;
};

export const PermissionStatus = ({ hasPermission }: PermissionProps) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator animating={true} />
            {hasPermission === null && <TP size={2}>Requesting camera permission</TP>}
            {hasPermission === false && <TP size={3}>No access to camera</TP>}
        </View>
    );
};

export const ScannerOverlay = () => {
    return (
        <View style={styles.overlay}>
            <View style={[commonStyles.alignItemsCenter, { marginTop: 20 }]}>
                <TP size={3} style={styles.colorWhite}>
                    Align QR Code within frame to scan
                </TP>
            </View>
            <View>
                <QrScannerBorders color="white" style={commonStyles.marginBottom}></QrScannerBorders>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    flashButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 42,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flashOnButton: {
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
        position: 'relative',
        gap: 40,
    },
    colorWhite: {
        color: theme.colors.white,
    },
});
