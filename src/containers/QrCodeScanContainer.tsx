import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TP } from '../components/atoms/THeadings';
import { commonStyles } from '../utils/theme';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import QrScannerBorders from '../assets/images/QrScannerBorders';

export default function QrCodeScanContainer(props: {
    onClose?: () => void;
    onScan: (result: BarCodeScannerResult) => void;
}) {
    const [hasPermission, setHasPermission] = useState(null as null | boolean);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);

    const handleBarCodeScanned = (result: BarCodeScannerResult) => {
        setScanned(true);
        props.onScan(result);
    };

    return (
        <View>
            <View>
                {hasPermission === null && <TP size={2}>Requesting for camera permission</TP>}
                {hasPermission === false && <TP size={3}>No access to camera</TP>}
                {hasPermission === true && (
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={{
                            width: '100%',
                            height: '90%',
                        }}
                    />
                )}
                {scanned && <TButtonContained onPress={() => setScanned(false)}> Tap to Scan Again</TButtonContained>}
            </View>
            {/* <View
                style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',

                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <TP
                    size={2}
                    style={{
                        color: 'white',
                    }}
                >
                    Align QR Code within frame to scan
                </TP>
                <QrScannerBorders
                    style={{
                        height: '75%',
                        width: '75%',
                    }}
                />
            </View> */}

            <View>
                <TButtonOutlined style={commonStyles.marginBottom} onPress={() => props.onClose()}>
                    Cancel
                </TButtonOutlined>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        marginTop: 50,
        alignSelf: 'center',
        width: 200,
        height: 200,
    },
    imageWrapper: {
        padding: 40,
        alignSelf: 'center',
    },
});
