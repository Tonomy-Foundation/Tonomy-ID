import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import QrScannerBorders from '../assets/images/QrScannerBorders';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import useErrorStore from '../store/errorStore';
import { Camera, FlashMode } from 'expo-camera';
import LayoutComponent from '../components/layout';

export default function QrCodeScanContainer(props: {
    onClose?: () => void;
    onScan: (result: BarCodeScannerResult) => void;
}) {
    const [hasPermission, setHasPermission] = useState(null as null | boolean);
    const [scanned, setScanned] = useState(false);
    const [isFlashlightOn, setFlashLightOn] = useState(false);
    const errorStore = useErrorStore();

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            try {
                const { status } = await BarCodeScanner.requestPermissionsAsync();

                setHasPermission(status === 'granted');
            } catch (e: any) {
                errorStore.setError({ error: e, expected: false });
            }
        };

        getBarCodeScannerPermissions();
    }, []);

    const toggleFlashLight = () => {
        setFlashLightOn(!isFlashlightOn);
    };

    const handleBarCodeScanned = (result: BarCodeScannerResult) => {
        setScanned(true);
        props.onScan(result);
    };

    return (
        <>
            {hasPermission === true && (
                <>
                    <View style={styles.QRContainer}>
                        <View style={styles.QROverlay}>
                            <View style={[commonStyles.alignItemsCenter, commonStyles.marginBottom]}>
                                <TP size={3} style={[styles.colorWhite, commonStyles.marginBottom]}>
                                    Align QR Code within frame to scan
                                </TP>
                                <IconButton
                                    icon={isFlashlightOn ? 'flashlight-off' : 'flashlight'}
                                    onPress={toggleFlashLight}
                                    color={styles.colorWhite.color}
                                    style={[styles.iconButton]}
                                ></IconButton>
                            </View>

                            <QrScannerBorders style={commonStyles.marginBottom}></QrScannerBorders>

                            <View style={commonStyles.marginBottom}>
                                <TButtonContained
                                    size="huge"
                                    style={commonStyles.marginBottom}
                                    onPress={() => (props.onClose ? props.onClose() : null)}
                                >
                                    Cancel
                                </TButtonContained>
                                {scanned && (
                                    <TButtonContained onPress={() => setScanned(false)} size="huge">
                                        Tap to Scan Again
                                    </TButtonContained>
                                )}
                            </View>
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
                </>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    QR: {
        height: 420,
        width: '100%',
        borderRadius: 4,
    },
    QRContainer: {
        flex: 1,
        position: 'relative',
    },
    QROverlay: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 16,
        justifyContent: 'space-between',
    },

    flex: {
        flex: 1,
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
});
