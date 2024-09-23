import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Props } from '../screens/SignTransactionConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import {
    ChainType,
    IAccount,
    IAsset,
    IChainSession,
    IOperation,
    IPrivateKey,
    ITransaction,
    TransactionType,
} from '../utils/chain/types';
import { capitalizeFirstLetter } from '../utils/strings';

import { extractHostname } from '../utils/network';
import TSpinner from '../components/atoms/TSpinner';
import { formatCurrencyValue } from '../utils/numbers';
import useErrorStore from '../store/errorStore';
import AccountDetails from '../components/AccountDetails';
import Tooltip from 'react-native-walkthrough-tooltip';
import { IconButton } from 'react-native-paper';
import { ResolvedSigningRequest } from '@wharfkit/signing-request';
import { Web3WalletTypes } from '@walletconnect/web3wallet';
import Debug from 'debug';

const debug = Debug('tonomy-id:components:SignTransactionConsentContainer');

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
    const [balanceError, showBalanceError] = useState(false);
    const [account, setAccount] = useState<IAccount | null>(null);
    const chainName = capitalizeFirstLetter(transaction.getChain().getName());
    const chainIcon = transaction.getChain().getLogoUrl();
    const chainType = transaction.getChain().getChainType();
    const errorsStore = useErrorStore();
    const refTopUpDetail = useRef(null);

    const handleCompleteTransaction = useCallback(() => setTransactionLoading(false), []);

    useEffect(() => {
        async function fetchAccountName() {
            try {
                setAccount(await transaction.getFrom());
            } catch (e) {
                errorStore.setError({
                    title: 'Error fetching account name',
                    error: e,
                    expected: false,
                });
            }
        }

        fetchAccountName();
    }, [errorStore, transaction]);

    async function onReject() {
        setTransactionLoading(true);

        await session.rejectTransactionRequest(request);

        setTransactionLoading(false);

        navigation.navigate({
            name: 'UserHome',
            params: {},
        });
    }

    async function onAccept() {
        try {
            setTransactionLoading(true);

            const transactionRequest = await session.createTransactionRequest(transaction);

            const signedTransaction = await privateKey.sendTransaction(transactionRequest);

            await session.approveTransactionRequest(request, signedTransaction);
            navigation.navigate('SignTransactionSuccess', {
                transaction,
                signTransactionHash: (signedTransaction as { hash?: string })?.hash ?? '',
            });
            setTransactionLoading(false);
        } catch (error) {
            setTransactionLoading(false);
            errorsStore.setError({
                title: 'Signing Error',
                error: new Error(`Error signing transaction, ${error}`),
                expected: false,
            });

            navigation.navigate({
                name: 'UserHome',
                params: {},
            });
            await session.rejectTransactionRequest(request);
        }
    }

    function TransferOperationDetails({ operation, onComplete }: { operation: IOperation; onComplete: () => void }) {
        const [to, setTo] = useState<string | null>(null);
        const [amount, setAmount] = useState<string | null>(null);
        const [usdValue, setUsdValue] = useState<string | null>(null);

        useEffect(() => {
            async function fetchOperationDetails() {
                try {
                    const to = (await operation.getTo()).getName();

                    setTo(transaction.getChain().formatShortAccountName(to));
                    const value = await operation.getValue();

                    setAmount(value.toString());
                    const usdValue = await value.getUsdValue();

                    setUsdValue(formatCurrencyValue(usdValue, 2));
                    onComplete();
                } catch (e) {
                    errorStore.setError({
                        title: 'Error fetching transaction operation details',
                        error: e,
                        expected: false,
                    });
                }
            }

            fetchOperationDetails();
        }, [operation, onComplete]);

        return (
            <View style={styles.appDialog}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.secondaryColor}>Recipient:</Text>
                    <Text>{to}</Text>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 12,
                    }}
                >
                    <Text style={styles.secondaryColor}>Amount:</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text>{amount ? amount : <TSpinner />}</Text>
                        <Text style={[styles.secondaryColor]}>{usdValue ? `($${usdValue})` : <TSpinner />}</Text>
                    </View>
                </View>
            </View>
        );
    }

    function ContractOperationDetails({ operation, onComplete }: { operation: IOperation; onComplete: () => void }) {
        const [showActionDetails, setShowActionDetails] = useState(false);
        const [details, setTransactionDetails] = useState<Record<string, string> | null>(null);
        const [functionName, setFunctionName] = useState<string | null>(null);
        const [contract, setContract] = useState<string | null>(null);

        useEffect(() => {
            async function fetchOperationDetails() {
                try {
                    setContract((await operation.getTo()).getName());
                    setFunctionName(await operation.getFunction());
                    setTransactionDetails(await operation.getArguments());
                    onComplete();
                } catch (e) {
                    errorStore.setError({
                        title: 'Error fetching contract operation details',
                        error: e,
                        expected: false,
                    });
                }
            }

            fetchOperationDetails();
        }, [operation, onComplete]);

        return (
            <View style={styles.actionDialog}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.secondaryColor}>Smart Contract:</Text>
                    <Text>{contract ? contract : <TSpinner />}</Text>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                    }}
                >
                    <Text style={styles.secondaryColor}>Function:</Text>
                    <Text>{functionName ? functionName : <TSpinner />}</Text>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 3,
                    }}
                >
                    <Text style={styles.secondaryColor}>Transaction details:</Text>

                    <TouchableOpacity onPress={() => setShowActionDetails(!showActionDetails)}>
                        {!showActionDetails ? (
                            <IconButton
                                icon={Platform.OS === 'android' ? 'chevron-down' : 'chevron-down'}
                                size={Platform.OS === 'android' ? 18 : 22}
                            />
                        ) : (
                            <IconButton
                                icon={Platform.OS === 'android' ? 'chevron-up' : 'chevron-up'}
                                size={Platform.OS === 'android' ? 18 : 22}
                            />
                        )}
                    </TouchableOpacity>
                </View>
                {details && (
                    <View style={styles.detailSection}>
                        {Object.entries(details).map(([key, value], idx) => (
                            <View
                                key={idx}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 7,
                                }}
                            >
                                <Text style={[styles.secondaryColor, { fontSize: 13 }]}>{key}:</Text>
                                <Text style={{ fontSize: 13 }}>{value ? value.toString() : '--'}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    }

    function OperationDetails({ operation, onComplete }: { operation: IOperation; onComplete: () => void }) {
        const [type, setType] = useState<TransactionType | null>(null);

        const handleComplete = useCallback(() => {
            onComplete();
        }, [onComplete]);

        useEffect(() => {
            async function fetchOperationType() {
                try {
                    setType(await operation.getType());
                } catch (e) {
                    errorStore.setError({
                        title: 'Error fetching operation type',
                        error: e,
                        expected: false,
                    });
                }
            }

            fetchOperationType();
        }, [operation, type]);

        if (type === null) {
            return <TSpinner />;
        } else if (type === TransactionType.TRANSFER) {
            return <TransferOperationDetails operation={operation} onComplete={handleComplete} />;
        } else if (type === TransactionType.CONTRACT) {
            return <ContractOperationDetails operation={operation} onComplete={handleComplete} />;
        } else {
            throw new Error('TransactionType.BOTH operation not supported yet');
        }
    }

    function Operations({ onComplete }: { onComplete: () => void }) {
        const [operation, setOperation] = useState<IOperation | IOperation[] | null>(null);
        const [, setOperationsComplete] = useState<boolean[]>([false]);

        const setComplete = useCallback(
            (index: number) => {
                try {
                    setOperationsComplete((prev) => {
                        const newComplete = [...prev];

                        newComplete[index] = true;

                        if (newComplete.every((complete) => complete)) {
                            onComplete();
                        }

                        return newComplete;
                    });
                } catch (e) {
                    errorStore.setError({
                        title: 'Error setting complete',
                        error: e,
                        expected: false,
                    });
                }
            },
            [onComplete]
        );
        const setCompleteFirst = useCallback(() => setComplete(0), [setComplete]);

        useEffect(() => {
            async function fetchOperation() {
                try {
                    if (chainType === ChainType.ANTELOPE) {
                        const operations = await transaction.getOperations();

                        if (operations.length > 1) {
                            throw new Error('Multiple operations not supported yet');
                            // TODO:
                            // <OperationDetails operation={operation} onComplete={() => setComplete(index)} />
                            // causes an error because onComplete must be provided a const function created with useCallback()
                            // Otherwise it will be re-created on every render and the useEffect will not be able to detect the change
                            setOperationsComplete(new Array(operations.length).fill(false));
                            setOperation(operations[0]);
                        } else {
                            setOperation(operations);
                        }
                    } else {
                        setOperation(transaction);
                    }
                } catch (e) {
                    errorStore.setError({
                        title: 'Error fetching operations',
                        error: e,
                        expected: false,
                    });
                }
            }

            fetchOperation();
        }, [setComplete]);

        if (!operation) {
            return <TSpinner />;
        } else if (Array.isArray(operation)) {
            if (operation.length > 1) {
                return operation.map((operation, index) => (
                    <View key={index} style={{ width: '100%' }}>
                        <Text style={styles.actionText}>Action {index + 1}</Text>
                        <OperationDetails operation={operation} onComplete={() => setComplete(index)} />
                    </View>
                ));
            } else {
                return <OperationDetails operation={operation[0]} onComplete={setCompleteFirst} />;
            }
        } else {
            return <OperationDetails operation={operation} onComplete={setCompleteFirst} />;
        }
    }

    function TransactionAccount() {
        if (!account) {
            return <TSpinner />;
        }

        const shortAccountName = transaction.getChain().formatShortAccountName(account.getName());

        return <Text style={styles.accountNameStyle}>{shortAccountName}</Text>;
    }

    function TransactionFee({ onComplete }: { onComplete: () => void }) {
        const [toolTipVisible, setToolTipVisible] = useState(false);
        const [fee, setFee] = useState<{ fee: string; usdFee: string } | null>(null);

        useEffect(() => {
            async function fetchFee() {
                try {
                    const fee = await transaction.estimateTransactionFee();
                    const usdFee = await fee.getUsdValue();

                    const feeString = fee.toString(4);
                    const usdFeeString = formatCurrencyValue(usdFee, 2);

                    setFee({ fee: feeString, usdFee: usdFeeString });
                    onComplete();
                } catch (e) {
                    errorStore.setError({
                        title: 'Error fetching transaction fee',
                        error: e,
                        expected: false,
                    });
                }
            }

            fetchFee();
        }, [onComplete]);

        return (
            <View style={styles.appDialog}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.secondaryColor}>Transaction fee:</Text>

                        <Tooltip
                            isVisible={toolTipVisible}
                            content={
                                <Text style={{ color: theme.colors.white, fontSize: 13 }}>
                                    This fee is paid to operators of the {chainName} Network to process this transaction
                                </Text>
                            }
                            placement="top"
                            onClose={() => setToolTipVisible(false)}
                            contentStyle={{
                                backgroundColor: theme.colors.black,
                            }}
                        >
                            <TouchableOpacity onPress={() => setToolTipVisible(true)}>
                                <Text style={styles.secondaryColor}>(?)</Text>
                            </TouchableOpacity>
                        </Tooltip>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {fee ? (
                            <>
                                <Text>{fee.fee}</Text>
                                <Text style={[styles.secondaryColor]}>${fee.usdFee}</Text>
                            </>
                        ) : (
                            <TSpinner />
                        )}
                    </View>
                </View>
            </View>
        );
    }

    function TransactionTotal({ onComplete }: { onComplete: () => void }) {
        const [total, setTotal] = useState<{ total: string; totalUsd: string } | null>(null);
        const [balanceError, setBalanceError] = useState<boolean>(false);

        useEffect(() => {
            async function fetchTotal() {
                try {
                    const total = await transaction.estimateTransactionTotal();
                    const usdTotal = await total.getUsdValue();

                    const totalString = total.toString(4);
                    const usdTotalString = formatCurrencyValue(usdTotal, 2);

                    setTotal({ total: totalString, totalUsd: usdTotalString });

                    // TODO: uncomment after fixing Antelope issue
                    // const accountBalance = (
                    //     await account.getBalance(transaction.getChain().getNativeToken())
                    // ).getAmount();

                    // if (accountBalance < total.getAmount()) {
                    //     // TODO probably can make this cleaner with one control variable
                    //     showBalanceError(true);
                    //     setBalanceError(true);
                    // }
                    onComplete();
                } catch (e) {
                    errorStore.setError({
                        title: 'Error fetching total',
                        error: e,
                        expected: false,
                    });
                }
            }

            fetchTotal();
        }, [onComplete]);

        return (
            <>
                <View
                    style={[
                        styles.totalSection,
                        {
                            backgroundColor: balanceError ? theme.colors.errorBackground : theme.colors.info,
                        },
                    ]}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ marginRight: 8, fontWeight: '600' }}>Total estimated cost:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {total ? (
                                <>
                                    <Text>{total.total}</Text>
                                    <Text style={styles.secondaryColor}>${total.totalUsd}</Text>
                                </>
                            ) : (
                                <TSpinner />
                            )}
                        </View>
                    </View>

                    {balanceError && <Text style={styles.balanceError}>Not enough balance</Text>}
                </View>
                {balanceError && (
                    <View style={{ width: '100%', marginTop: 10 }}>
                        <TButtonContained
                            onPress={() => {
                                (refTopUpDetail.current as any)?.open(); // Open the AccountDetails component here
                            }}
                            style={commonStyles.marginBottom}
                            size="medium"
                        >
                            Top Up
                        </TButtonContained>
                    </View>
                )}
            </>
        );
    }

    function TransactionDetails({ onComplete }: { onComplete: () => void }) {
        const [, setCompletedComponents] = useState<boolean[]>([false, false, false]);

        const setCompleted = useCallback(
            (index: number) => {
                try {
                    setCompletedComponents((prev) => {
                        const newComplete = [...prev];

                        newComplete[index] = true;

                        if (newComplete.every((complete) => complete)) {
                            onComplete();
                        }

                        return newComplete;
                    });
                } catch (e) {
                    errorStore.setError({
                        title: 'Error setting complete',
                        error: e,
                        expected: false,
                    });
                }
            },
            [onComplete]
        );
        const setCompleteOperations = useCallback(() => setCompleted(0), [setCompleted]);
        const setCompleteFee = useCallback(() => setCompleted(1), [setCompleted]);
        const setCompleteTotal = useCallback(() => setCompleted(2), [setCompleted]);

        return (
            <>
                <View style={styles.networkHeading}>
                    <Image source={{ uri: chainIcon }} style={styles.imageStyle} />
                    <Text style={styles.nameText}>{chainName} Network</Text>
                </View>
                <TransactionAccount />
                <Operations onComplete={setCompleteOperations} />
                <TransactionFee onComplete={setCompleteFee} />
                <TransactionTotal onComplete={setCompleteTotal} />
            </>
        );
    }

    return (
        <LayoutComponent
            body={
                <ScrollView>
                    <View style={styles.container}>
                        <Image
                            style={[styles.logo, commonStyles.marginBottom]}
                            source={{ uri: transaction.getChain().getNativeToken().getLogoUrl() }}
                        ></Image>
                        <View style={commonStyles.alignItemsCenter}>
                            <Text style={styles.applinkText}>{extractHostname(origin)}</Text>
                            <Text style={{ marginLeft: 6, fontSize: 19 }}>wants you to sign a transaction</Text>
                        </View>
                        <TransactionDetails onComplete={handleCompleteTransaction} />
                    </View>
                    {account && (
                        <AccountDetails
                            refMessage={refTopUpDetail}
                            accountDetails={{
                                symbol: transaction.getChain().getNativeToken().getSymbol(),
                                image: chainIcon,
                                name: chainName,
                                address: account.getName(),
                            }}
                            onClose={() => (refTopUpDetail.current as any)?.close()}
                        />
                    )}
                </ScrollView>
            }
            footer={
                <View style={{ marginTop: 30 }}>
                    <TButtonContained
                        disabled={transactionLoading || balanceError}
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
    transactionHeading: {
        marginTop: 11,
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
    actionDialog: {
        borderWidth: 1,
        borderColor: theme.colors.grey5,
        borderStyle: 'solid',
        borderRadius: 7,
        padding: 16,
        width: '100%',
        marginTop: 8,
    },
    totalSection: {
        padding: 16,
        width: '100%',
        marginTop: 20,
        borderRadius: 7,
    },
    detailSection: {
        backgroundColor: theme.colors.info,
        padding: 10,
        width: '100%',
        borderRadius: 7,
    },
    padding: {
        paddingHorizontal: 30,
    },
    secondaryColor: {
        color: theme.colors.secondary2,
        marginLeft: 4,
    },
    rawTransaction: {
        color: theme.colors.secondary,
        marginTop: 15,
        width: '100%',
        textAlign: 'center',
    },
    rawTransactionDrawer: {
        paddingHorizontal: 15,
        paddingVertical: 25,
    },
    drawerHead: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
    },
    drawerParagragh: {
        fontSize: 13,
    },
    scrollViewConditions: {
        paddingHorizontal: 18,
        paddingRight: 18,
        paddingVertical: 0,
        margin: 0,
    },
    balanceError: {
        textAlign: 'right',
        marginTop: 5,
        color: theme.colors.error,
        fontSize: 13,
    },
    popoverText: {
        color: theme.colors.white,
        fontSize: 11,
    },
    actionText: {
        fontWeight: 'bold',
        textAlign: 'left',
        marginTop: 10,
        marginLeft: 2,
    },
});
