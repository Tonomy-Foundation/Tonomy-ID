import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TButtonContained } from '../components/atoms/TButton';
import { TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import QrScannerBorders from '../assets/images/QrScannerBorders';
import { ActivityIndicator } from 'react-native-paper';
import useErrorStore from '../store/errorStore';
import { Camera, FlashMode } from 'expo-camera';
import { Props } from '../screens/QrCodeScanScreen';
import FlashOnIcon from '../assets/icons/FlashIcon';

export default function QRScanContainer(props: Props) {
    const [hasPermission, setHasPermission] = useState(null as null | boolean);
    const [scanned, setScanned] = useState(false);
    const [isFlashlightOn, setFlashLightOn] = useState(false);
    const errorStore = useErrorStore();

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            try {
                const { status } = await BarCodeScanner.requestPermissionsAsync();

                setHasPermission(status === 'granted');
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            }
        };

        getBarCodeScannerPermissions();
    }, []);

    const toggleFlashLight = () => {
        setFlashLightOn(!isFlashlightOn);
    };

    const handleBarCodeScanned = (result: BarCodeScannerResult) => {
        if (!scanned) props.onScan(result);
        setScanned(true);
    };

    return (
        <>
            {hasPermission === true && (
                <>
                    <View style={styles.QRContainer}>
                        <View style={styles.QROverlay}>
                            <View style={[commonStyles.alignItemsCenter, { marginTop: 20 }]}>
                                <TP size={3} style={[styles.colorWhite]}>
                                    Align QR Code within frame to scan
                                </TP>
                            </View>
                            <View>
                                <QrScannerBorders color="white" style={commonStyles.marginBottom}></QrScannerBorders>
                            </View>

                            <View style={{ ...commonStyles.marginBottom }}>
                                {scanned && (
                                    <TButtonContained onPress={() => setScanned(false)} size="huge">
                                        Tap to Scan Again
                                    </TButtonContained>
                                )}
                                <TouchableOpacity
                                    style={[styles.flashButton, isFlashlightOn && styles.flashOnButton]}
                                    onPress={toggleFlashLight}
                                >
                                    <FlashOnIcon color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Camera
                            flashMode={isFlashlightOn ? FlashMode.torch : FlashMode.off}
                            barCodeScannerSettings={{
                                barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                            }}
                            onBarCodeScanned={handleBarCodeScanned}
                            style={StyleSheet.absoluteFill}
                        />
                    </View>
                </>
            )}
            {hasPermission !== true && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator animating={true}></ActivityIndicator>
                    {hasPermission === null && <TP size={2}>Requesting camera permission</TP>}
                    {hasPermission === false && <TP size={3}>No access to camera</TP>}
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
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

    colorWhite: {
        color: theme.colors.white,
    },
    iconButton: {
        borderColor: theme.colors.white,
        borderWidth: 1,
    },
    loadingContainer: {
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
});
