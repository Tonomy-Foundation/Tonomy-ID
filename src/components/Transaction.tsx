import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import theme, { commonStyles } from '../utils/theme';
import { IAsset, TransactionType } from '../utils/chain/types';
import Tooltip from 'react-native-walkthrough-tooltip';
import { IconButton } from 'react-native-paper';
import { QuestionMark, WarningCircle } from 'iconoir-react-native';
import NegligibleTransactionFees from './NegligibleTransactionFees';
import { KeyValue } from '../utils/strings';
import { formatCurrencyValue } from '../utils/numbers';

export type TransactionFeeData = {
    fee: string;
    usdFee: number;
    show: boolean;
};

export type OperationData = {
    type: TransactionType;
    to?: string;
    amount?: string;
    usdValue?: string;
    contractName?: string;
    functionName?: string;
    args?: KeyValue;
};

export function Operations({ operations, date }: { operations: OperationData[]; date?: Date }) {
    if (operations.length > 1) {
        return (
            <>
                {operations.map((operation, index) => (
                    <View key={index} style={{ width: '100%' }}>
                        <Text style={styles.actionText}>Transaction {index + 1}</Text>
                        <OperationDetails operation={operation} date={date} />
                    </View>
                ))}
            </>
        );
    } else {
        return <OperationDetails operation={operations[0]} />;
    }
}

export function OperationDetails({ operation, date }: { operation: OperationData; date?: Date }) {
    if (operation.type === TransactionType.TRANSFER) {
        return <TransferOperationDetails operation={operation} date={date} />;
    } else if (operation.type === TransactionType.CONTRACT) {
        return <ContractOperationDetails operation={operation} date={date} />;
    } else {
        throw new Error('Unsupported transaction type');
    }
}

function formattedDateString(date: Date) {
    const day = date.getDate();
    const month = date.toLocaleString('default', {
        month: 'long',
    });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function TransferOperationDetails({ operation, date }: { operation: OperationData; date?: Date }) {
    return (
        <View style={styles.appDialog}>
            {date && (
                <View style={styles.appDialogView}>
                    <Text style={styles.secondaryColor}>Date:</Text>
                    <Text>{formattedDateString(date)}</Text>
                </View>
            )}
            <View style={styles.appDialogView}>
                <Text style={styles.secondaryColor}>Recipient:</Text>
                <Text>{operation.to}</Text>
            </View>
            <View style={styles.appDialogAmountView}>
                <Text style={styles.secondaryColor}>Amount:</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text>{operation.amount}</Text>
                    <Text style={[styles.secondaryColor]}>(${operation.usdValue})</Text>
                </View>
            </View>
        </View>
    );
}

export function ContractOperationDetails({ operation, date }: { operation: OperationData; date?: Date }) {
    const [showActionDetails, setShowActionDetails] = useState(false);
    const [funToolTipVisible, setFunToolTipVisible] = useState(false);
    const [tranToolTipVisible, setTranToolTipVisible] = useState(false);

    return (
        <View style={styles.actionDialog}>
            {date && (
                <View style={styles.actionDialogView}>
                    <Text style={styles.secondaryColor}>Date:</Text>
                    <Text>{formattedDateString(date)}</Text>
                </View>
            )}
            <View style={styles.actionDialogView}>
                <Text style={styles.secondaryColor}>Smart Contract:</Text>
                <Text>{operation.contractName}</Text>
            </View>
            <View style={styles.actionDialogView}>
                <Text style={styles.secondaryColor}>Function:</Text>
                {operation.functionName ? (
                    <Text style={{ color: theme.colors.secondary }}>{`${operation.functionName}()`}</Text>
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setFunToolTipVisible(true)}>
                            <Text style={{ color: theme.colors.grey9 }}>unknown</Text>
                            <Tooltip
                                isVisible={funToolTipVisible}
                                content={
                                    <Text style={styles.tooltipText}>
                                        Function arguments are unknown. Make sure you trust this app
                                    </Text>
                                }
                                disableShadow
                                placement="top"
                                onClose={() => setFunToolTipVisible(false)}
                                contentStyle={{ backgroundColor: theme.colors.gray10 }}
                            >
                                <WarningCircle
                                    style={{ marginLeft: 2 }}
                                    width={15}
                                    height={15}
                                    color={theme.colors.gold}
                                />
                            </Tooltip>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <View style={styles.transactionDetailsView}>
                <Text style={styles.secondaryColor}>Transaction details:</Text>
                {operation.args ? (
                    <TouchableOpacity onPress={() => setShowActionDetails(!showActionDetails)}>
                        {!showActionDetails ? (
                            <IconButton
                                style={{ height: 20 }}
                                icon={Platform.OS === 'android' ? 'chevron-down' : 'chevron-down'}
                                size={Platform.OS === 'android' ? 18 : 22}
                            />
                        ) : (
                            <IconButton
                                style={{ height: 20 }}
                                icon={Platform.OS === 'android' ? 'chevron-up' : 'chevron-up'}
                                size={Platform.OS === 'android' ? 18 : 22}
                            />
                        )}
                    </TouchableOpacity>
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setTranToolTipVisible(true)}>
                            <Text style={{ color: theme.colors.grey9 }}>unknown</Text>
                            <Tooltip
                                isVisible={tranToolTipVisible}
                                content={
                                    <Text style={styles.tooltipText}>
                                        Transaction details are unknown. Make sure you trust this app
                                    </Text>
                                }
                                disableShadow
                                placement="top"
                                onClose={() => setTranToolTipVisible(false)}
                                contentStyle={{ backgroundColor: theme.colors.gray10 }}
                            >
                                <WarningCircle
                                    style={{ marginLeft: 2 }}
                                    width={15}
                                    height={15}
                                    color={theme.colors.gold}
                                />
                            </Tooltip>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            {showActionDetails && operation.args && (
                <View style={styles.detailSection}>
                    {Object.entries(operation.args).map(([key, value], idx) => (
                        <View
                            key={idx}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Text style={[styles.secondaryColor, { fontSize: 13 }]}>{key}:</Text>
                            <Text style={{ fontSize: 13 }}>{value}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

// shows the fee only if the transaction does not contain asset transfers, or is not free
export function showFee(operations: OperationData[] | unknown, asset: IAsset, usdFee: number): boolean {
    if (!Array.isArray(operations)) return false;

    const onlySmartContractOperations =
        operations.filter((operation) => operation.type === TransactionType.CONTRACT).length === operations.length;
    const isFree = asset.getAmount() === BigInt(0) && usdFee === 0;

    return !(onlySmartContractOperations && isFree);
}

const NEGLIGIBLE_FEE_USD = 0.001;

export function TransactionFee({ transactionFee }: { transactionFee: TransactionFeeData }) {
    const [toolTipVisible, setToolTipVisible] = useState(false);
    const refMessage = useRef<{ open: () => void; close: () => void }>(null);
    const isNegligible = transactionFee.usdFee <= NEGLIGIBLE_FEE_USD;
    const amount = parseFloat(transactionFee.fee.split(' ')[0]);
    const isFree = amount === 0 && transactionFee.usdFee === 0;

    if (!transactionFee.show) {
        return null;
    }

    const onClose = () => {
        refMessage.current?.close();
    };

    function FeeValue() {
        if (isFree) return <Text>free</Text>;
        else if (isNegligible) {
            return (
                <TouchableOpacity onPress={() => refMessage.current?.open()} style={{ marginLeft: 2 }}>
                    <Text>negligible</Text>
                    <WarningCircle width={15} height={15} color={theme.colors.success} />
                </TouchableOpacity>
            );
        } else {
            return (
                <>
                    <Text>{transactionFee.fee}</Text>
                    <Text style={[styles.secondaryColor, commonStyles.secondaryFontFamily]}>
                        (${formatCurrencyValue(transactionFee.usdFee, 2)})
                    </Text>
                </>
            );
        }
    }

    return (
        <View style={styles.appDialog}>
            <NegligibleTransactionFees transactionFee={transactionFee} onClose={onClose} refMessage={refMessage} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.secondaryColor}>Transaction fee:</Text>
                    <Tooltip
                        isVisible={toolTipVisible}
                        content={
                            <Text style={styles.tooltipText}>
                                This fee is paid to operators of the network to process this transaction
                            </Text>
                        }
                        placement="top"
                        onClose={() => setToolTipVisible(false)}
                        contentStyle={{ backgroundColor: theme.colors.black }}
                    >
                        <TouchableOpacity style={styles.tooltipIconQue} onPress={() => setToolTipVisible(true)}>
                            <QuestionMark width={13} height={13} color={theme.colors.success} />
                        </TouchableOpacity>
                    </Tooltip>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FeeValue />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    appDialog: {
        borderWidth: 1,
        borderColor: theme.colors.grey5,
        borderStyle: 'solid',
        borderRadius: 7,
        padding: 16,
        width: '100%',
        marginTop: 20,
    },
    appDialogView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    appDialogAmountView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionDialog: {
        borderWidth: 1,
        borderColor: theme.colors.grey5,
        borderStyle: 'solid',
        borderRadius: 7,
        padding: 16,
        width: '100%',
        marginTop: 20,
        gap: 15,
    },
    actionDialogView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailSection: {
        backgroundColor: theme.colors.info,
        padding: 10,
        width: '100%',
        borderRadius: 7,
        gap: 8,
    },
    secondaryColor: {
        color: theme.colors.secondary2,
        marginLeft: 4,
        fontSize: 14,
        ...commonStyles.secondaryFontFamily,
    },
    tooltipText: {
        color: theme.colors.white,
        fontSize: 13,
    },
    transactionDetailsView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionText: {
        fontWeight: 'bold',
        textAlign: 'left',
        marginTop: 10,
        marginLeft: 2,
    },
    tooltipIconQue: {
        borderWidth: 1,
        borderColor: theme.colors.success,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
    tooltipIcon: {
        borderWidth: 1,
        borderColor: theme.colors.gold,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
});
