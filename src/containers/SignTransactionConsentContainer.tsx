import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Props } from '../screens/SignTransactionConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { ChainType, IChainSession, IOperation, IPrivateKey, ITransaction, TransactionType } from '../utils/chain/types';
import { capitalizeFirstLetter, extractHostname } from '../utils/helper';
import TSpinner from '../components/atoms/TSpinner';
import { ethers } from 'ethers';
import { formatCurrencyValue } from '../utils/numbers';
import useErrorStore from '../store/errorStore';
import AccountDetails from '../components/AccountDetails';
import Tooltip from 'react-native-walkthrough-tooltip';
import useUserStore from '../store/userStore';
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
    const [contractTransaction, setContractTransaction] = useState(true);
    const [loading, setLoading] = useState(false);
    const [transactionLoading, setTransactionLoading] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<{
        value: string;
        usdValue: number;
        fee: string;
        usdFee: number;
        total: string;
        usdTotal: number;
        chainType: ChainType | null;
        operation: IOperation | IOperation[] | null;
    }>({
        value: '',
        usdValue: 0,
        fee: '',
        usdFee: 0,
        total: '',
        usdTotal: 0,
        chainType: null,
        operation: null,
    });
    const [toolTipVisible, setToolTipVisible] = useState(false);
    const [balanceError, showBalanceError] = useState(false);
    const chainName = capitalizeFirstLetter(transaction.getChain().getName());
    const chainIcon = transaction.getChain().getLogoUrl();
    const errorsStore = useErrorStore();
    const refTopUpDetail = useRef(null);
    const [actionDetails, setActionDetail] = useState(false);
    const userStore = useUserStore();
    const user = userStore.user;

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                setLoading(true);
                setTransactionLoading(true);

                let value, usdValue, balance, operation: IOperation | IOperation[] | null;

                const chainType = transaction.getChain().getChainType();

                if (chainType === ChainType.ANTELOPE) {
                    const operations = await transaction.getOperations();

                    if (operations.length > 1) {
                        operation = operations[0];
                    } else {
                        operation = operations;
                    }
                } else {
                    operation = transaction;
                }

                const estimateFee = await transaction.estimateTransactionFee();

                const usdFee = await estimateFee.getUsdValue();

                let fee = estimateFee?.toString();

                fee = parseFloat(fee).toFixed(18);

                const estimateTotal = await transaction.estimateTransactionTotal();

                const usdTotal = await estimateTotal.getUsdValue();

                let total = estimateTotal?.toString();

                total = parseFloat(total).toFixed(18);

                if (value) {
                    const transactionValue = ethers.parseEther(parseFloat(value).toFixed(18));
                    const etherFee = ethers.parseEther(fee);

                    const totalTransactionCost = transactionValue + etherFee;

                    // Check if the balance is sufficient
                    if (balance < totalTransactionCost) {
                        showBalanceError(true);
                    }
                }

                setLoading(false);

                setTransactionDetails({
                    value,
                    usdValue,
                    fee,
                    usdFee,
                    total,
                    usdTotal,
                    chainType,
                    operation,
                });
                setTransactionLoading(false);
            } catch (e) {
                if (e === 'Not a contract call') {
                    setContractTransaction(false);
                }

                errorStore.setError({ error: e, expected: false });
                setLoading(false);
                setTransactionLoading(false);
            }
        };

        fetchTransactionDetails();
    }, []);

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
                transactionDetails: {
                    chainId: transaction.getChain().getChainId(),
                    transactionHash: (signedTransaction as { hash?: string })?.hash ?? '',
                    toAccount: transactionDetails.toAccount,
                    shortAccountName: transaction.getChain().formatShortAccountName(transactionDetails?.toAccount),
                    fee: transactionDetails.fee,
                    usdFee: transactionDetails.usdFee,
                    total: transactionDetails.total,
                    usdTotal: transactionDetails.usdTotal,
                },
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

    function TransferOperationDetails({ operation }: { operation: IOperation }) {
        const [to, setTo] = useState<string | null>(null);
        const [amount, setAmount] = useState<string | null>(null);
        const [usdValue, setUsdValue] = useState<string | null>(null);

        useEffect(() => {
            console.log('TransferOperationDetails', JSON.stringify(operation, null, 2));

            async function fetchOperationDetails() {
                const to = (await operation.getTo()).getName();

                console.log('TransferOperationDetails -> to', to);
                setTo(transaction.getChain().formatShortAccountName(to));
                const value = await operation.getValue();

                console.log('TransferOperationDetails -> value', value.toString());

                setAmount(value.toString());
                const usdValue = await value.getUsdValue();

                console.log('TransferOperationDetails -> usdValue', usdValue);

                setUsdValue(formatCurrencyValue(usdValue, 2));
            }

            fetchOperationDetails();
        }, []);

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

    function ContractOperationDetails({ operation }: { operation: IOperation }) {
        const [details, setTransactionDetails] = useState<Record<string, string> | null>(null);
        const [functionName, setFunctionName] = useState<string | null>(null);
        const [contract, setContract] = useState<string | null>(null);

        useEffect(() => {
            async function fetchOperationDetails() {
                setContract((await operation.getTo()).getName());
                setFunctionName(await operation.getFunction());
                setTransactionDetails(await operation.getArguments());
            }

            fetchOperationDetails();
        }, []);

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

                    <TouchableOpacity onPress={() => setActionDetail(!actionDetails)}>
                        {!actionDetails ? (
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

    function OperationDetails({ operation }: { operation: IOperation }) {
        const [type, setType] = useState<TransactionType | null>(null);

        useEffect(() => {
            async function fetchOperationType() {
                const type = await operation.getType();

                console.log('type found', type);
                setType(type);
            }

            fetchOperationType();
            debug('OperationDetails -> type', type);
        }, []);

        if (type === null) {
            return <TSpinner />;
        } else if (type === TransactionType.TRANSFER) {
            return <TransferOperationDetails operation={operation} />;
        } else if (type === TransactionType.CONTRACT) {
            return <ContractOperationDetails operation={operation} />;
        } else {
            throw new Error('TransactionType.BOTH operation not supported yet');
        }
    }

    function Operations({ operation }: { operation: IOperation | IOperation[] }) {
        if (Array.isArray(operation)) {
            debug('Operation Array');

            if (operation.length > 1) {
                return operation.map((operation, index) => (
                    <View key={index} style={{ width: '100%' }}>
                        <Text style={styles.actionText}>Action {index + 1}</Text>
                        <OperationDetails operation={operation} />
                    </View>
                ));
            } else {
                console.log('Operation Array with one');
                return <OperationDetails operation={operation[0]} />;
            }
        } else {
            debug('Single Operation');
            return <OperationDetails operation={operation} />;
        }
    }

    function TransactionAccount() {
        const [accountName, setAccountName] = useState<string | null>(null);

        useEffect(() => {
            async function fetchAccountName() {
                if (transactionDetails.chainType === ChainType.ANTELOPE) {
                    const username = (await user.getUsername()).getBaseUsername();

                    setAccountName('@' + username);
                } else {
                    const account = (await transaction.getFrom()).getName();

                    setAccountName(transaction.getChain().formatShortAccountName(account));
                }
            }

            fetchAccountName();
        }, []);

        if (!accountName) {
            return <TSpinner />;
        }

        return <Text style={styles.accountNameStyle}>{accountName}</Text>;
    }

    function TransactionDetails() {
        return (
            <>
                <View style={styles.networkHeading}>
                    <Image source={{ uri: chainIcon }} style={styles.imageStyle} />
                    <Text style={styles.nameText}>{chainName} Network</Text>
                </View>
                <TransactionAccount />
                {transactionDetails.operation && <Operations operation={transactionDetails.operation} />}

                <View style={styles.appDialog}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.secondaryColor}>Transaction fee:</Text>

                            <Tooltip
                                isVisible={toolTipVisible}
                                content={
                                    <Text style={{ color: theme.colors.white, fontSize: 13 }}>
                                        This fee is paid to operators of the {chainName} Network to process this
                                        transaction
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
                            <Text>{formatCurrencyValue(Number(transactionDetails?.fee), 5)}</Text>
                            <Text style={[styles.secondaryColor]}>
                                ($
                                {formatCurrencyValue(Number(transactionDetails?.usdFee.toFixed(4)), 3)})
                            </Text>
                        </View>
                    </View>
                </View>
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
                            <Text>{formatCurrencyValue(Number(transactionDetails?.total), 5)}</Text>
                            <Text style={styles.secondaryColor}>
                                ($
                                {formatCurrencyValue(Number(transactionDetails?.usdTotal.toFixed(4)), 3)})
                            </Text>
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
                        {!loading ? <TransactionDetails /> : <TSpinner style={{ marginBottom: 12 }} />}
                    </View>
                    <AccountDetails
                        refMessage={refTopUpDetail}
                        accountDetails={{
                            symbol: transaction.getChain().getNativeToken().getSymbol(),
                            image: chainIcon,
                            name: chainName,
                            address: transactionDetails.fromAccount,
                        }}
                        onClose={() => (refTopUpDetail.current as any)?.close()}
                    />
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
