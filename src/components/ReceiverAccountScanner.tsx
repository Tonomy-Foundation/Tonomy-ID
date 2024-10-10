import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from './TIconButton';
import theme from '../utils/theme';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import Debug from 'debug';
import QRCodeScanner from './QRCodeScanner';
import { IChain } from '../utils/chain/types';

const debug = Debug('tonomy-id:containers:MainContainer');

export type ReceiverAccountScannerProps = {
    refMessage: React.RefObject<{ open: () => void; close: () => void }>;
    onScanQR: (accountName: string) => void;
    chain: IChain;
};

const ReceiverAccountScanner = (props: ReceiverAccountScannerProps) => {
    async function onScan({ data }: BarCodeScannerResult) {
        if (!props.chain.isValidAccountName(data)) {
            throw new Error('The account you entered is invalid!');
        }

        props.onScanQR(data);
        onClose();
    }

    const onClose = () => {
        props.refMessage.current?.close();
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
                <TouchableOpacity onPress={onClose}>
                    <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <QRCodeScanner onScan={onScan} onClose={onClose} />
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

export default ReceiverAccountScanner;
