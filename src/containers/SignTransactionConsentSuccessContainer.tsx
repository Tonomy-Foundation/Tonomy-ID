import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Linking } from 'react-native';
import { Props } from '../screens/SignTransactionConsentSuccessScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';

import { TButtonContained, TButtonSecondaryContained } from '../components/atoms/TButton';

import { TH1 } from '../components/atoms/THeadings';
import TransactionSuccessIcon from '../assets/icons/TransactionSuccess';

import { formatCurrencyValue } from '../utils/numbers';
import { ITransactionReceipt, ITransactionRequest, TransactionType } from '../utils/chain/types';
import useErrorStore from '../store/errorStore';
import { OperationData, Operations, showFee, TransactionFee } from '../components/Transaction';

import TSpinner from '../components/atoms/TSpinner';

export default function SignTransactionConsentSuccessContainer({
    navigation,
    operations,
    receipt,
    request,
}: {
    navigation: Props['navigation'];
    operations: OperationData[];
    receipt: ITransactionReceipt;
    request: ITransactionRequest;
}) {
    const [total, setTotal] = useState<{ total: string; totalUsd: string } | null>(null);
    const [fee, setFee] = useState<{ fee: string; usdFee: number; show: boolean } | null>(null);
    const [date, setDate] = useState<Date | null>(null);

    const errorStore = useErrorStore();

    const backToHome = async () => {
        navigation.navigate('Assets');
    };

    const viewBlockExplorer = () => {
        const explorerUrl = receipt.getExplorerUrl();

        Linking.openURL(explorerUrl);
    };

    useEffect(() => {
        async function fetchTransactionDetail() {
            try {
                const date = await receipt.getTimestamp();

                setDate(date);

                const total = await request.transaction.estimateTransactionTotal();
                const usdTotal = await total.getUsdValue();

                const totalString = total.toString(4);
                const usdTotalString = formatCurrencyValue(usdTotal);

                setTotal({ total: totalString, totalUsd: usdTotalString });

                const fee = await receipt.getFee();
                const usdFee = await fee.getUsdValue();

                const feeString = fee.toString(4);

                setFee({ fee: feeString, usdFee, show: showFee(operations, fee, usdFee) });
            } catch (e) {
                errorStore.setError({
                    title: 'Error fetching total',
                    error: e,
                    expected: false,
                });
            }
        }

        fetchTransactionDetail();
    }, [errorStore, receipt, request.account, request.transaction]);

    return (
        <LayoutComponent
            body={
                <ScrollView>
                    <View style={styles.container}>
                        <TransactionSuccessIcon />
                        <View style={styles.transactionView}>
                            <TH1>Transaction successful</TH1>
                            <Text style={{ fontSize: 20, opacity: fee && fee.show ? 1 : 0 }}>
                                {`${total?.total} `}
                                <Text style={[styles.secondaryColor, commonStyles.secondaryFontFamily]}>
                                    (${total?.totalUsd})
                                </Text>
                            </Text>
                        </View>
                        {date ? (
                            <Operations operations={operations} date={date} />
                        ) : (
                            <Operations operations={operations} />
                        )}
                        {!fee && <TSpinner />}
                        {fee && <TransactionFee transactionFee={fee} />}
                        <TButtonSecondaryContained
                            theme="secondary"
                            style={{ width: '100%', marginTop: 25 }}
                            size="large"
                            onPress={viewBlockExplorer}
                        >
                            View on block explorer
                        </TButtonSecondaryContained>
                    </View>
                </ScrollView>
            }
            footer={
                <View style={{ marginTop: 30 }}>
                    <TButtonContained onPress={() => backToHome()} style={commonStyles.marginBottom} size="large">
                        Back to home screen
                    </TButtonContained>
                </View>
            }
            noFooterHintLayout={true}
        ></LayoutComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        textAlign: 'center',
    },
    appDialog: {
        borderWidth: 1,
        borderColor: theme.colors.grey5,
        borderStyle: 'solid',
        borderRadius: 7,
        padding: 14,
        width: '100%',
        marginTop: 10,
    },
    transactionView: {
        marginTop: 10,
        ...commonStyles.alignItemsCenter,
    },
    secondaryColor: {
        color: theme.colors.secondary2,
        marginLeft: 4,
    },
});
