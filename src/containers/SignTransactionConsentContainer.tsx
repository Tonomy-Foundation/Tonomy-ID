import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { Props } from '../screens/SignTransactionConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { IChainSession, IOperation, IPrivateKey, ITransaction, TransactionType } from '../utils/chain/types';
import { extractHostname } from '../utils/network';
import TSpinner from '../components/atoms/TSpinner';
import { formatCurrencyValue } from '../utils/numbers';
import useErrorStore from '../store/errorStore';
import { ResolvedSigningRequest } from '@wharfkit/signing-request';
import { Web3WalletTypes } from '@walletconnect/web3wallet';
import Debug from 'debug';
import AccountDetails from '../components/AccountDetails';
import { OperationData, Operations, TransactionFee, TransactionFeeData } from '../components/Transaction.tsx';

const debug = Debug('tonomy-id:components:SignTransactionConsentContainer');

type TransactionTotalData = {
    total: string;
    totalUsd: string;
    balanceError: boolean;
};

export default function SignTransactionConsentContainer({
    navigation,
    transaction,
    privateKey,
    origin,
    request,
    session,
}: {
    navigation: Props['navigation'];
    transaction: ITransaction;
    privateKey: IPrivateKey;
    origin: string;
    request: Web3WalletTypes.SessionRequest | ResolvedSigningRequest;
    session: IChainSession;
}) {
    const errorStore = useErrorStore();
    const [transactionLoading, setTransactionLoading] = useState(true);
    const [operations, setOperations] = useState<OperationData[] | null>(null);
    const [accountName, setAccountName] = useState<string | null>(null);
    const [transactionFeeData, setTransactionFeeData] = useState<TransactionFeeData | null>(null);
    const [transactionTotalData, setTransactionTotalData] = useState<TransactionTotalData | null>(null);
    const topUpBalance = useRef<{ open: () => void; close: () => void }>(null);

    const chain = transaction.getChain();
    const chainIcon = chain.getLogoUrl();
    const chainName = chain.getName();
    const chainSymbol = chain.getNativeToken().getSymbol();

    const getOperationData = useCallback(
        async (operation: IOperation) => {
            const type = await operation.getType();

            if (type === TransactionType.TRANSFER) {
                const to = chain.formatShortAccountName((await operation.getTo()).getName());
                const value = await operation.getValue();

                const amount = value.toString();
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
        const total = await transaction.estimateTransactionTotal();
        const usdTotal = await total.getUsdValue();
        const balanceError = false;
        // TODO: uncomment after fixing Antelope issue
        // const accountBalance = (await account.getBalance(chain.getNativeToken())).getAmount();

        // if (accountBalance < total.getAmount()) {
        //     balanceError = true;
        // }

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
        await session.rejectTransactionRequest(request);
        setTransactionLoading(false);
        navigation.navigate({ name: 'UserHome', params: {} });
    }

    async function onAccept() {
        try {
            setTransactionLoading(true);
            if (!operations) throw new Error('Operations not loaded');
            const transactionRequest = await session.createTransactionRequest(transaction);

            const receipt = await privateKey.sendTransaction(transactionRequest);

            await session.approveTransactionRequest(request, receipt);
            navigation.navigate('SignTransactionSuccess', {
                operations,
                transaction,
                receipt,
            });
            setTransactionLoading(false);
        } catch (error) {
            setTransactionLoading(false);
            errorStore.setError({
                title: 'Signing Error',
                error,
                expected: false,
            });
            navigation.navigate({ name: 'UserHome', params: {} });
            await session.rejectTransactionRequest(request);
        }
    }

    return (
        <LayoutComponent
            body={
                <ScrollView>
                    <View style={styles.container}>
                        <Image
                            style={[styles.logo, commonStyles.marginBottom]}
                            source={{ uri: chain.getNativeToken().getLogoUrl() }}
                        ></Image>
                        <View style={commonStyles.alignItemsCenter}>
                            <Text style={styles.applinkText}>{extractHostname(origin)}</Text>
                            <Text style={{ marginLeft: 6, fontSize: 19 }}>wants you to sign a transaction</Text>
                        </View>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ marginRight: 8, fontWeight: '600' }}>Total estimated cost:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text>{transactionTotal.total}</Text>
                    <Text style={styles.secondaryColor}>${transactionTotal.totalUsd}</Text>
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
        fontSize: 14,
        marginTop: 5,
    },
    nameText: {
        color: theme.colors.secondary2,
        marginLeft: 5,
        fontSize: 15,
    },
    // transactionHeading: {
    //     marginTop: 11,
    // },
    // appDialog: {
    //     borderWidth: 1,
    //     borderColor: theme.colors.grey5,
    //     borderStyle: 'solid',
    //     borderRadius: 7,
    //     padding: 16,
    //     width: '100%',
    //     marginTop: 20,
    // },
    // actionDialog: {
    //     borderWidth: 1,
    //     borderColor: theme.colors.grey5,
    //     borderStyle: 'solid',
    //     borderRadius: 7,
    //     padding: 16,
    //     width: '100%',
    //     marginTop: 8,
    // },
    totalSection: {
        padding: 16,
        width: '100%',
        marginTop: 20,
        borderRadius: 7,
    },
    // detailSection: {
    //     backgroundColor: theme.colors.info,
    //     padding: 10,
    //     width: '100%',
    //     borderRadius: 7,
    // },
    // padding: {
    //     paddingHorizontal: 30,
    // },
    secondaryColor: {
        color: theme.colors.secondary2,
        marginLeft: 4,
    },
    // rawTransaction: {
    //     color: theme.colors.secondary,
    //     marginTop: 15,
    //     width: '100%',
    //     textAlign: 'center',
    // },
    // rawTransactionDrawer: {
    //     paddingHorizontal: 15,
    //     paddingVertical: 25,
    // },
    // drawerHead: {
    //     fontSize: 20,
    //     fontWeight: '600',
    //     marginBottom: 20,
    // },
    // drawerParagragh: {
    //     fontSize: 13,
    // },
    // scrollViewConditions: {
    //     paddingHorizontal: 18,
    //     paddingRight: 18,
    //     paddingVertical: 0,
    //     margin: 0,
    // },
    balanceError: {
        textAlign: 'right',
        marginTop: 5,
        color: theme.colors.error,
        fontSize: 13,
    },
    // popoverText: {
    //     color: theme.colors.white,
    //     fontSize: 11,
    // },
    // actionText: {
    //     fontWeight: 'bold',
    //     textAlign: 'left',
    //     marginTop: 10,
    //     marginLeft: 2,
    // },
});
