import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Linking } from 'react-native';
import { Props } from '../screens/SignTransactionConsentSuccessScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';

import { TButtonContained, TButtonSecondaryContained } from '../components/atoms/TButton';

import { TH1 } from '../components/atoms/THeadings';
import TransactionSuccessIcon from '../assets/icons/TransactionSuccess';

import { formatCurrencyValue } from '../utils/numbers';
import { ITransaction, ITransactionReceipt, ITransactionRequest } from '../utils/chain/types';
import useErrorStore from '../store/errorStore';
import { OperationData, Operations, TransactionFee } from '../components/Transaction';

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
    const [fee, setFee] = useState<{ fee: string; usdFee: string; show: boolean } | null>(null);
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
                const usdFeeString = formatCurrencyValue(usdFee);

                if (request.account && request.transaction.getExpiration()) {
                    setFee({ fee: feeString, usdFee: usdFeeString, show: false });
                } else {
                    setFee({ fee: feeString, usdFee: usdFeeString, show: true });
                }
            } catch (e) {
                errorStore.setError({
                    title: 'Error fetching total',
                    error: e,
                    expected: false,
                });
            }
        }

        fetchTransactionDetail();
    }, [errorStore, receipt, request.transaction]);

    return (
        <LayoutComponent
            body={
                <ScrollView>
                    <View style={styles.container}>
                        <TransactionSuccessIcon />
                        <View style={styles.transactionView}>
                            <TH1>Transaction successful</TH1>
                            {fee && (
                                <Text style={{ fontSize: 20 }}>
                                    {`${total?.total} `}
                                    <Text style={[styles.secondaryColor, commonStyles.secondaryFontFamily]}>
                                        (${total?.totalUsd})
                                    </Text>
                                </Text>
                            )}
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
