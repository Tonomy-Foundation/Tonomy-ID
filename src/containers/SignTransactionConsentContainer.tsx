import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, Text, ScrollView, Linking } from 'react-native';
import { Props } from '../screens/SignTransactionConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { IOperation, PlatformType, ITransactionRequest, TransactionType } from '../utils/chain/types';
import { extractHostname } from '../utils/network';
import { formatCurrencyValue } from '../utils/numbers';
import useErrorStore from '../store/errorStore';
import Debug from 'debug';
import AccountDetails from '../components/AccountDetails';
import { OperationData, Operations, TransactionFee, TransactionFeeData } from '../components/Transaction';
import TSpinner from '../components/atoms/TSpinner';
import { ApplicationError, ApplicationErrors } from '../utils/errors';

const debug = Debug('tonomy-id:components:SignTransactionConsentContainer');

type TransactionTotalData = {
    total: string;
    totalUsd: string;
    balanceError: boolean;
};

export default function SignTransactionConsentContainer({
    navigation,
    request,
}: {
    navigation: Props['navigation'];
    request: ITransactionRequest;
}) {
    const { transaction } = request;

    const errorStore = useErrorStore();
    const [transactionLoading, setTransactionLoading] = useState(true);
    const [operations, setOperations] = useState<OperationData[] | null>(null);
    const [accountName, setAccountName] = useState<string | null>(null);
    const [transactionFeeData, setTransactionFeeData] = useState<TransactionFeeData | null>(null);
    const [transactionTotalData, setTransactionTotalData] = useState<TransactionTotalData | null>(null);
    const topUpBalance = useRef<{ open: () => void; close: () => void }>(null);

    const chain = request.transaction.getChain();
    const chainIcon = chain.getLogoUrl();
    const chainName = chain.getName();
    const chainSymbol = chain.getNativeToken().getSymbol();
    const origin = request.getOrigin();
    const hostname = origin ? extractHostname(origin) : null;
    const topLevelHostname = hostname ? hostname.split('.').slice(-2).join('.') : null;

    const getOperationData = useCallback(
        async (operation: IOperation) => {
            const type = await operation.getType();

            if (type === TransactionType.TRANSFER) {
                const to = chain.formatShortAccountName((await operation.getTo()).getName());
                const value = await operation.getValue();
                const precision = chain.getNativeToken().getPrecision();
                const amount = value.toString(precision <= 4 ? 4 : 6).replace(/\.?0+$/, '');

                const usdValue = formatCurrencyValue(await value.getUsdValue(), 2);

                return {
                    type,
                    to,
                    amount,
                    usdValue,
                };
            } else if (type === TransactionType.CONTRACT) {
                const contractName = chain.formatShortAccountName((await operation.getTo()).getName());
                const functionName = await operation.getFunction();
                const args = await operation.getArguments();

                return {
                    type,
                    contractName,
                    functionName,
                    args,
                };
            } else {
                throw new Error('Unsupported transaction type');
            }
        },
        [chain]
    );

    const fetchAccountName = useCallback(async () => {
        const account = await transaction.getFrom();
        const accountName = chain.formatShortAccountName(account.getName());

        setAccountName(accountName);
        debug('fetchAccountName() done', accountName);
    }, [transaction, chain]);

    const fetchOperations = useCallback(async () => {
        if (transaction.hasMultipleOperations()) {
            const operations = await transaction.getOperations();
            const syncedOperations: OperationData[] = await Promise.all(operations.map(getOperationData));

            setOperations(syncedOperations);
            debug('fetchOperations() done', syncedOperations);
        } else {
            const syncedOperations: OperationData[] = [await getOperationData(transaction)];

            setOperations(syncedOperations);
            debug('fetchOperations() done', syncedOperations);
        }
    }, [transaction, getOperationData]);

    const fetchTransactionFee = useCallback(async () => {
        const fee = await transaction.estimateTransactionFee();
        const usdFee = await fee.getUsdValue();
        const transactionFee = { fee: fee.toString(4), usdFee: formatCurrencyValue(usdFee, 2) };

        setTransactionFeeData(transactionFee);
        debug('fetchTransactionFee() done', transactionFee);
    }, [transaction]);

    const fetchTransactionTotal = useCallback(async () => {
        const account = await transaction.getFrom();
        const total = await transaction.estimateTransactionTotal();
        const usdTotal = await total.getUsdValue();
        let balanceError = false;

        const accountBalance = (await account.getBalance(chain.getNativeToken())).getAmount();

        if (accountBalance < total.getAmount()) {
            balanceError = true;
        }

        const transactionTotal = {
            total: total.toString(4),
            totalUsd: formatCurrencyValue(usdTotal, 2),
            balanceError,
        };

        setTransactionTotalData(transactionTotal);
        debug('fetchTransactionTotal() done', transactionTotal);
    }, [transaction]);

    useEffect(() => {
        async function fetchTransactionData() {
            try {
                setTransactionLoading(true);
                await Promise.all([
                    fetchAccountName(),
                    fetchOperations(),
                    fetchTransactionFee(),
                    fetchTransactionTotal(),
                ]);
            } catch (error) {
                errorStore.setError({
                    title: 'Error fetching transaction details',
                    error: error,
                    expected: false,
                });
            } finally {
                setTransactionLoading(false);
            }
        }

        fetchTransactionData();
    }, [fetchAccountName, fetchOperations, fetchTransactionFee, fetchTransactionTotal, errorStore]);

    async function onReject() {
        setTransactionLoading(true);

        await request.reject();
        setTransactionLoading(false);
        navigation.navigate('Assets');
    }

    async function onAccept() {
        try {
            setTransactionLoading(true);
            if (!operations) throw new Error('Operations not loaded');
            const receipt = await request.approve();

            navigation.navigate('SignTransactionSuccess', {
                operations,
                transaction,
                receipt,
            });

            setTransactionLoading(false);
        } catch (error) {
            setTransactionLoading(false);

            if (error instanceof ApplicationError && error.code === ApplicationErrors.NotEnoughCoins) {
                errorStore.setError({
                    title: 'Insufficient Balance',
                    error: new Error('You do not have enough coins to complete this transaction.'),
                    expected: true,
                });
            } else if (
                error instanceof ApplicationError &&
                error?.code === ApplicationErrors.IncorrectTransactionAuthorization
            ) {
                errorStore.setError({
                    title: 'Authorization Error',
                    error: new Error(
                        'This transaction expected a different account or key to sign it. Please try login with another account.'
                    ),
                    expected: true,
                });
            } else {
                errorStore.setError({
                    title: 'Signing Error',
                    error,
                    expected: false,
                });
                navigation.navigate('Assets');
            }

            navigation.navigate('Assets');

            if (request.session) {
                await request.reject();
            }
        }
    }

    return (
        <LayoutComponent
            body={
                <ScrollView>
                    <View style={styles.container}>
                        {origin ? (
                            <>
                                <Image
                                    style={[styles.logo, commonStyles.marginBottom]}
                                    source={{ uri: chain.getNativeToken().getLogoUrl() }}
                                ></Image>
                                <View style={commonStyles.alignItemsCenter}>
                                    <Text style={styles.applinkText}>{topLevelHostname}</Text>
                                    <Text style={{ marginLeft: 6, fontSize: 19 }}>wants you to sign a transaction</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.sandingMain}>
                                <Text style={styles.sandingTitle}>You are sending </Text>
                                {operations && (
                                    <View style={styles.sandingContent}>
                                        <Text
                                            style={{
                                                fontSize: 24,
                                                fontWeight: '600',
                                                ...commonStyles.primaryFontFamily,
                                            }}
                                        >
                                            {operations[0].amount
                                                ? parseFloat(operations[0].amount).toFixed(4)
                                                : '0.0000'}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.secondaryColor,
                                                commonStyles.secondaryFontFamily,
                                                { fontSize: 22 },
                                            ]}
                                        >
                                            (${operations[0].usdValue})
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                        <View style={styles.networkHeading}>
                            <Image source={{ uri: chainIcon }} style={styles.imageStyle} />
                            <Text style={styles.nameText}>{chainName} Network</Text>
                        </View>
                        {!accountName && <TSpinner />}
                        {accountName && <TransactionAccount accountName={accountName} />}
                        {!operations && <TSpinner />}
                        {operations && <Operations operations={operations} />}
                        {!transactionFeeData && <TSpinner />}
                        {transactionFeeData && <TransactionFee transactionFee={transactionFeeData} />}
                        {!transactionTotalData && <TSpinner />}
                        {transactionTotalData && (
                            <TransactionTotal
                                transactionTotal={transactionTotalData}
                                onTopUp={() => {
                                    topUpBalance?.current?.open();
                                }}
                            />
                        )}
                    </View>
                    {accountName && (
                        <AccountDetails
                            refMessage={topUpBalance}
                            accountDetails={{
                                symbol: chainSymbol,
                                image: chainIcon,
                                name: chainName,
                                accountName,
                            }}
                            onClose={() => topUpBalance?.current?.close()}
                        />
                    )}
                </ScrollView>
            }
            footer={
                <View style={{ marginTop: 30 }}>
                    <TButtonContained
                        disabled={transactionLoading}
                        onPress={() => onAccept()}
                        style={commonStyles.marginBottom}
                        size="large"
                    >
                        Sign Transaction
                    </TButtonContained>
                    <TButtonOutlined size="large" disabled={transactionLoading} onPress={() => onReject()}>
                        Cancel
                    </TButtonOutlined>
                </View>
            }
            noFooterHintLayout={true}
        ></LayoutComponent>
    );
}

function TransactionAccount({ accountName }: { accountName: string }) {
    return <Text style={styles.accountNameStyle}>{accountName}</Text>;
}

function TransactionTotal({
    transactionTotal,
    onTopUp,
}: {
    transactionTotal: TransactionTotalData;
    onTopUp: () => void;
}) {
    return (
        <View
            style={[
                styles.totalSection,
                {
                    backgroundColor: transactionTotal.balanceError ? theme.colors.errorBackground : theme.colors.info,
                },
            ]}
        >
            <View style={styles.totalView}>
                <Text style={styles.totalTitle}>Total</Text>
                <View style={styles.totalContentView}>
                    <Text style={styles.totalContent}>{transactionTotal.total}</Text>
                    <Text style={styles.secondaryColor}>(${transactionTotal.totalUsd})</Text>
                </View>
                {transactionTotal.balanceError && <Text style={styles.balanceError}>Not enough balance</Text>}
            </View>
            {transactionTotal.balanceError && (
                <View style={{ width: '100%', marginTop: 10 }}>
                    <TButtonContained onPress={onTopUp} style={commonStyles.marginBottom} size="medium">
                        Top Up
                    </TButtonContained>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'column',
    },
    logo: {
        width: 50,
        height: 50,
    },
    applinkText: {
        color: theme.colors.linkColor,
        margin: 0,
        padding: 2,
        fontSize: 19,
    },
    applinkContent: {
        marginLeft: 6,
        fontSize: 19,
    },
    sandingMain: {
        alignItems: 'center',
        marginVertical: 10,
    },
    sandingTitle: {
        fontSize: 24,
        fontWeight: '600',
        ...commonStyles.primaryFontFamily,
    },
    sandingContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalTitle: {
        marginRight: 8,
        fontWeight: '600',
    },
    totalContentView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalContent: {
        fontSize: 16,
        ...commonStyles.secondaryFontFamily,
    },
    imageStyle: {
        width: 10,
        height: 13,
    },
    networkHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    accountNameStyle: {
        fontSize: 16,
        marginTop: 5,
        ...commonStyles.secondaryFontFamily,
    },
    nameText: {
        color: theme.colors.secondary2,
        marginLeft: 5,
        fontSize: 14,
    },
    totalSection: {
        padding: 16,
        width: '100%',
        marginTop: 20,
        borderRadius: 7,
    },
    secondaryColor: {
        color: theme.colors.secondary2,
        marginLeft: 4,
        fontSize: 16,
        ...commonStyles.secondaryFontFamily,
    },
    balanceError: {
        textAlign: 'right',
        marginTop: 5,
        color: theme.colors.error,
        fontSize: 13,
    },
});
