import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Linking } from 'react-native';
import { Props } from '../screens/SignTransactionConsentSuccessScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';

import { TButtonContained, TButtonSecondaryContained } from '../components/atoms/TButton';

import { TH1 } from '../components/atoms/THeadings';
import TransactionSuccessIcon from '../assets/icons/TransactionSuccess';

import { formatCurrencyValue } from '../utils/numbers';
import { formatDateTime } from '../utils/date';
import { IAccount, ITransaction } from '../utils/chain/types';
import useErrorStore from '../store/errorStore';

export default function SignTransactionConsentSuccessContainer({
    navigation,
    transaction,
    transactionHash,
}: {
    navigation: Props['navigation'];
    transaction: ITransaction;
    transactionHash: string;
}) {
    const [total, setTotal] = useState<{ total: string; totalUsd: string } | null>(null);
    const [recipient, setRecipient] = useState<IAccount | null>(null);
    const [fee, setFee] = useState<{ fee: string; usdFee: string } | null>(null);

    const errorStore = useErrorStore();

    const backToHome = async () => {
        navigation.navigate({
            name: 'UserHome',
            params: {},
        });
    };

    const viewBlockExplorer = () => {
        const explorerUrl = transaction.getChain().getExplorerUrl({ transactionHash });

        Linking.openURL(explorerUrl);
    };

    useEffect(() => {
        async function fetchTransactionDetail() {
            try {
                const total = await transaction.estimateTransactionTotal();
                const usdTotal = await total.getUsdValue();

                const totalString = total.toString(4);
                const usdTotalString = formatCurrencyValue(usdTotal, 2);

                setTotal({ total: totalString, totalUsd: usdTotalString });
                const recipient = await transaction.getTo();

                setRecipient(recipient);
                const fee = await transaction.estimateTransactionFee();
                const usdFee = await fee.getUsdValue();

                const feeString = fee.toString(4);
                const usdFeeString = formatCurrencyValue(usdFee, 2);

                setFee({ fee: feeString, usdFee: usdFeeString });
            } catch (e) {
                errorStore.setError({
                    title: 'Error fetching total',
                    error: e,
                    expected: false,
                });
            }
        }

        fetchTransactionDetail();
    }, []);

    return (
        <LayoutComponent
            body={
                <ScrollView>
                    <View style={styles.container}>
                        <TransactionSuccessIcon />
                        <View style={{ marginTop: 10, ...commonStyles.alignItemsCenter }}>
                            <TH1>Transaction successful</TH1>
                            <Text style={{ fontSize: 20 }}>
                                {total?.total}
                                <Text style={styles.secondaryColor}>${total?.totalUsd}</Text>
                            </Text>
                        </View>
                        <View style={styles.appDialog}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text style={styles.secondaryColor}>Date:</Text>
                                <Text>{formatDateTime(new Date())}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.secondaryColor}>Recipient:</Text>
                                <Text>{recipient?.getName()}</Text>
                            </View>
                        </View>

                        <View style={styles.appDialog}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.secondaryColor}>Gas fee:</Text>
                                <Text>
                                    {fee?.fee}
                                    <Text style={styles.secondaryColor}>${fee?.usdFee}</Text>
                                </Text>
                            </View>
                        </View>
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
    secondaryColor: {
        color: theme.colors.secondary2,
        marginLeft: 4,
    },
});
