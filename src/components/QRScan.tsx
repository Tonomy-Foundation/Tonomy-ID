import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from '../components/TIconButton';
import theme from '../utils/theme';
import { BarCodeScannerResult } from 'expo-barcode-scanner';

import Debug from 'debug';

import QRScanContainer from '../containers/QRScanContainer';

const debug = Debug('tonomy-id:containers:MainContainer');

export type QRScanProps = {
    refMessage: React.RefObject<any>;
    onClose: () => void;
    cryptoWallet?: boolean;
    onScan?: (address) => void;
};

const QRScan = (props: QRScanProps) => {
    async function onScan({ data }: BarCodeScannerResult) {
        const address = validateCryptoAddress(data);

        if (props.onScan) props.onScan(address);
    }

    const validateCryptoAddress = (input) => {
        const parts = input.split(':');

        if (parts.length !== 2) {
            throw new Error('Invalid format. Use "type:address".');
        }

        const [type, address] = parts;

        return address;
    };

    const onClose = () => {
        props.onClose();
    };

    return (
        <RBSheet
            ref={props.refMessage}
            openDuration={150}
            closeDuration={100}
            height={700}
            customStyles={{ container: { borderTopStartRadius: 8, borderTopEndRadius: 8 } }}
        >
            <View style={styles.rawTransactionDrawer}>
                <Text style={styles.drawerHead}>Scan QR code</Text>
                <TouchableOpacity onPress={props.onClose}>
                    <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <QRScanContainer onScan={onScan} onClose={onClose} />
            </View>
        </RBSheet>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 50,
    },
    rawTransactionDrawer: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    drawerHead: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 8,
    },
});

export default QRScan;
