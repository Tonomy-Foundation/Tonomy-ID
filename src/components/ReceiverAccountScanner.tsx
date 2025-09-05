import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from './TIconButton';
import theme from '../utils/theme';
import {  BarcodeScanningResult } from 'expo-camera';
import Debug from 'debug';
import QRCodeScanner from './QRCodeScanner';
import { ChainType, IChain } from '../utils/chain/types';
import useErrorStore from '../store/errorStore';

const debug = Debug('tonomy-id:components:ReceiverAccountScanner');

export type ReceiverAccountScannerProps = {
    refMessage: React.RefObject<{ open: () => void; close: () => void } | null>;
    onScanQR: (accountName: string) => void;
    chain: IChain;
};

const ReceiverAccountScanner = (props: ReceiverAccountScannerProps) => {
    const errorStore = useErrorStore();

    async function onScan({ data }: BarcodeScanningResult) {
        debug('send scan data: ', data);
        const chainType = props.chain.getChainType();
        let account = data;

        if (chainType === ChainType.ETHEREUM) {
            account = data.replace(/^.*?(0x[a-fA-F0-9]{40})$/, '$1');
        }

        if (!props.chain.isValidAccountName(account)) {
            props.refMessage.current?.close();
            errorStore.setError({
                error: new Error('The account you entered is invalid!'),
                expected: true,
            });
            return;
        }

        props.onScanQR(account);
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
