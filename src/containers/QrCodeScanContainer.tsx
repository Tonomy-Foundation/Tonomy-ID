import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TP } from '../components/atoms/THeadings';
import { commonStyles } from '../utils/theme';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import QrScannerBorders from '../assets/images/QrScannerBorders';
import { ActivityIndicator } from 'react-native-paper';
import useErrorStore from '../store/errorStore';

export default function QrCodeScanContainer(props: {
    onClose?: () => void;
    onScan: (result: BarCodeScannerResult) => void;
}) {
    const [hasPermission, setHasPermission] = useState(null as null | boolean);
    const [scanned, setScanned] = useState(false);
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

    const handleBarCodeScanned = (result: BarCodeScannerResult) => {
        setScanned(true);
        props.onScan(result);
    };

    return (
        <View>
            {hasPermission === true && (
                <View>
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={{
                            width: '100%',
                            height: '90%',
                        }}
                    />
                    <View>
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
                    {hasPermission === null && <TP size={2}>Requesting for camera permission</TP>}
                    {hasPermission === false && <TP size={3}>No access to camera</TP>}
                    <ActivityIndicator animating={true}></ActivityIndicator>
                </View>
            )}
        </View>
    );
}
