import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, Dimensions } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import FingerprintIcon from '../assets/icons/FingerprintIcon';
import LayoutComponent from '../components/layout';
import { commonStyles } from '../utils/theme';
import { BarCodeScanner } from 'expo-barcode-scanner';

export const width = Dimensions.get('window').width * 0.01;
export const height = Dimensions.get('window').height * 0.01;

export default function QrCodeScanContainer() {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    };

    //   if (hasPermission === null) {
    //     return <Text>Requesting for camera permission</Text>;
    //   }
    //   if (hasPermission === false) {
    //     return <Text>No access to camera</Text>;
    //   }

    return (
        <LayoutComponent
            body={<View>
                <View style={styles.container}>
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={{
                            width: width * 90,
                            height: height * 80,
                        }}
                    />

                </View>
                <View style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <TP style={{
                        color: 'rgb(255, 255, 255)'
                    }}>Align QR Code within frame to scan</TP>
                    <Image source={require('../assets/images/qrScannerBorders.png')}
                        style={{
                            height: '75%',
                            width: '75%',
                            resizeMode: 'contain'
                        }} />
                </View>
            </View>
            }
            footer={
                <View>
                    <TButtonOutlined style={commonStyles.marginBottom}>Cancel</TButtonOutlined>
                </View>
            }
        />
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
    container: {
        height: '100%',
        width: '100%',
        overflow:'hidden'
        // backgroundColor: 'blue',
        // height: 600,
        // width: '100%',
        // alignItems: 'center',
        // justifyContent: 'center',
    }
});
