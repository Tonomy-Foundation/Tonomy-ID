import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from '../components/TIconButton';
import theme, { commonStyles } from '../utils/theme';
import { TransactionFeeData } from './Transaction';
import { formatCurrencyValue } from '../utils/numbers';

export type props = {
    refMessage: React.RefObject<any>;
    onClose: () => void;
    transactionFee: TransactionFeeData;
    precision: number;
};

const NegligibleTransactionFees = (props: props) => {
    return (
        <RBSheet
            ref={props.refMessage}
            openDuration={150}
            closeDuration={100}
            height={175}
            customStyles={{ container: { borderTopStartRadius: 8, borderTopEndRadius: 8 } }}
        >
            <View style={styles.rawTransactionDrawer}>
                <Text style={styles.drawerHead}>Transaction fee</Text>
                <TouchableOpacity onPress={props.onClose}>
                    <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} />
                </TouchableOpacity>
            </View>
            <ScrollView>
                <View style={styles.content}>
                    <View>
                        <Text style={{ ...commonStyles.primaryFontFamily, fontSize: 17 }}>
                            {props.transactionFee.fee.toString(props.precision)}
                        </Text>
                        <Text style={{ color: theme.colors.secondary2, fontSize: 15 }}>
                            ${formatCurrencyValue(props.transactionFee.usdFee)}
                        </Text>
                    </View>
                </View>
            </ScrollView>
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
        fontSize: 19,
        fontWeight: '600',
        marginTop: 8,
    },
    drawerTitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 18.75,
    },
    darwerContent: {
        fontSize: 15.5,
        fontWeight: '400',
        lineHeight: 21,
        marginTop: 8,
    },
    drawerInnerContent: {
        fontWeight: '700',
    },
});

export default NegligibleTransactionFees;
