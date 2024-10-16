import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { Camera, FlashMode } from 'expo-camera';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { TP } from './atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import QrScannerBorders from '../assets/images/QrScannerBorders';
import { useFocusEffect } from '@react-navigation/native';
import useErrorStore from '../store/errorStore';

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

type ScannerOverlayProps = {
    isFlashlightOn: boolean;
    onPress: () => void;
};

export const ScannerOverlay = ({ isFlashlightOn, onPress }: ScannerOverlayProps) => {
    return (
        <View style={styles.overlay}>
            <View style={[commonStyles.alignItemsCenter, { marginTop: 20 }]}>
                <TP size={3} style={styles.colorWhite}>
                    Align QR Code within frame to scan
                </TP>
                <IconButton
                    icon={isFlashlightOn ? 'flashlight-off' : 'flashlight'}
                    onPress={onPress}
                    color={styles.colorWhite.color}
                    style={[styles.iconButton]}
                ></IconButton>
            </View>
            <View>
                <QrScannerBorders color="white" style={commonStyles.marginBottom}></QrScannerBorders>
            </View>
        </View>
    );
};

export type Props = {
    onClose?: () => void;
    onScan: (result: BarCodeScannerResult) => void;
};

export default function QRCodeScanner(props: Props) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isFlashlightOn, setFlashLightOn] = useState(false);
    const errorStore = useErrorStore();

    useFocusEffect(
        useCallback(() => {
            setHasPermission(null);
            setFlashLightOn(false);

            const getBarCodeScannerPermissions = async () => {
                try {
                    const { status } = await BarCodeScanner.requestPermissionsAsync();

                    setHasPermission(status === 'granted');
                } catch (e) {
                    errorStore.setError({ error: e, expected: false });
                }
            };

            getBarCodeScannerPermissions();
        }, [errorStore])
    );

    const toggleFlashLight = () => setFlashLightOn(!isFlashlightOn);

    return (
        <>
            {hasPermission === true ? (
                <View style={styles.QRContainer}>
                    <ScannerOverlay isFlashlightOn={isFlashlightOn} onPress={toggleFlashLight} />
                    <CameraView onBarCodeScanned={props.onScan} isFlashlightOn={isFlashlightOn} />
                </View>
            ) : (
                <PermissionStatus hasPermission={hasPermission} />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },

    QRContainer: {
        flex: 1,
        borderRadius: 25,
        position: 'relative',
        overflow: 'hidden',
    },
    QROverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
        position: 'relative',
        gap: 40,
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
    iconButton: {
        borderColor: theme.colors.white,
        borderWidth: 1,
    },
});
