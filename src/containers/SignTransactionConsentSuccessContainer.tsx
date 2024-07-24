import React from 'react';
import { View, StyleSheet, ScrollView, Text, Linking } from 'react-native';
import { Props } from '../screens/SignTransactionConsentSuccessScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';

import { TButtonContained, TButtonSecondaryContained } from '../components/atoms/TButton';
import { ITransaction, TransactionType } from '../utils/chain/types';
import { TH1 } from '../components/atoms/THeadings';
import TransactionSuccessIcon from '../assets/icons/TransactionSuccess';

import { formatCurrencyValue } from '../utils/numbers';
import { formatDateTime } from '../utils/date';

export default function SignTransactionConsentSuccessContainer({
    navigation,
    transaction,
    signedTransactionHash,
    transactionDetails,
}: {
    navigation: Props['navigation'];
    transaction: ITransaction;
    signedTransactionHash: string;
    transactionDetails: {
        transactionType: TransactionType | null;
        fromAccount: string;
        toAccount: string;
        value: string;
        usdValue: number;
        functionName: string;
        args: Record<string, string> | null;
        fee: string;
        usdFee: number;
        total: string;
        usdTotal: number;
    };
}) {
    const backToHome = () => {
        navigation.navigate({
            name: 'UserHome',
            params: {},
        });
    };

    const viewBlockExplorer = () => {
        let explorerUrl;
        const chain = transaction.getChain();
        const chainId = chain.getChainId();
        if (chainId.toString() === '1') {
            explorerUrl = `https://etherscan.io/tx/${signedTransactionHash}`;
        } else {
            explorerUrl = `https://sepolia.etherscan.io/tx/${signedTransactionHash}`;
        }
        Linking.openURL(explorerUrl);
    };

    return (
        <LayoutComponent
            body={
                <ScrollView>
                    <View style={styles.container}>
                        <TransactionSuccessIcon />
                        <View style={{ marginTop: 15, ...commonStyles.alignItemsCenter }}>
                            <TH1>Transaction successful</TH1>
                            <Text style={{ fontSize: 20 }}>
                                {`${formatCurrencyValue(Number(transactionDetails?.total), 5)} ETH`}
                                <Text style={styles.secondaryColor}>
                                    {` ($${formatCurrencyValue(Number(transactionDetails?.usdTotal.toFixed(4)), 3)})`}
                                </Text>
                            </Text>
                        </View>
                        <View style={styles.appDialog}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.secondaryColor}>Date:</Text>
                                <Text>{formatDateTime(new Date())}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.secondaryColor}>Recipient:</Text>
                                <Text>
                                    {transaction.getChain().formatShortAccountName(transactionDetails?.toAccount)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.appDialog}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.secondaryColor}>Gas fee:</Text>
                                <Text>
                                    {formatCurrencyValue(Number(transactionDetails?.fee), 5)}
                                    <Text style={styles.secondaryColor}>
                                        ($
                                        {formatCurrencyValue(Number(transactionDetails?.usdFee.toFixed(4)), 3)})
                                    </Text>
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
        padding: 16,
        width: '100%',
        marginTop: 20,
    },
    secondaryColor: {
        color: theme.colors.secondary2,
        marginLeft: 4,
    },
});
