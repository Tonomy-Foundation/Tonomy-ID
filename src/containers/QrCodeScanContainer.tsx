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
        <View style={styles.container}>
            {hasPermission === true && (
                <View style={styles.flex}>
                    <View style={styles.QRContainer}>
                        <View style={styles.QROverlay}>
                            <TP style={styles.colorWhite}>Align QR Code within frame to scan</TP>
                            <QrScannerBorders style={styles.QRBorder}></QrScannerBorders>
                            <IconButton
                                icon={isFlashlightOn ? 'flashlight-off' : 'flashlight'}
                                onPress={toggleFlashLight}
                                color={styles.colorWhite.color}
                                style={[styles.iconButton]}
                            ></IconButton>
                        </View>
                        <Camera
                            flashMode={isFlashlightOn ? FlashMode.torch : FlashMode.off}
                            barCodeScannerSettings={{
                                barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                            }}
                            onBarCodeScanned={handleBarCodeScanned}
                            style={styles.QR}
                        />
                    </View>
                    <View style={styles.buttonsContianer}>
                        <TButtonOutlined
                            style={commonStyles.marginBottom}
                            onPress={() => (props.onClose ? props.onClose() : null)}
                        >
                            Cancel
                        </TButtonOutlined>
                        {scanned && (
                            <TButtonContained onPress={() => setScanned(false)}> Tap to Scan Again</TButtonContained>
                        )}
                    </View>
                </View>
            )}
            {hasPermission !== true && (
                <View>
                    <ActivityIndicator animating={true}></ActivityIndicator>
                    {hasPermission === null && <TP size={2}>Requesting for camera permission</TP>}
                    {hasPermission === false && <TP size={3}>No access to camera</TP>}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    QR: {
        height: 470,
        width: Dimensions.get('window').width - 24,
    },
    QRContainer: {
        position: 'relative',
        marginBottom: 16,
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
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    QRBorder: {
        transform: [
            {
                scale: 1.2,
            },
        ],
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
    buttonsContianer: {
        paddingTop: 16,
    },
});
