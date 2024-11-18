import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { Props } from '../screens/SignTransactionConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { ChainType, IOperation, ITransactionReceipt, ITransactionRequest, TransactionType } from '../utils/chain/types';
import { extractHostname } from '../utils/network';
import { formatCurrencyValue } from '../utils/numbers';
import useErrorStore from '../store/errorStore';
import Debug from 'debug';
import AccountDetails from '../components/AccountDetails';
import { OperationData, Operations, TransactionFee, TransactionFeeData } from '../components/Transaction';
import TSpinner from '../components/atoms/TSpinner';
import { ApplicationError, ApplicationErrors } from '../utils/errors';
import { Images } from '../assets';
import settings from '../settings';
import useAppSettings from '../hooks/useAppSettings';

const debug = Debug('tonomy-id:components:SignTransactionConsentContainer');

type TransactionTotalData = {
    total: string;
    totalUsd: string;
    balanceError: boolean;
    show: boolean;
};

export default function SignTransactionConsentContainer({
    navigation,
    request,
}: {
    navigation: Props['navigation'];
    request: ITransactionRequest;
}) {
    const { transaction } = request;

    const [expired, setExpired] = useState(false);
    const [remainingTime, setRemainingTime] = useState('00:00');

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
    const hostname = request.getOrigin() ? extractHostname(request.getOrigin()) : null;
    const topLevelHostname = hostname ? hostname.split('.').slice(-2).join('.') : null;
    const { developerMode } = useAppSettings();

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
        const fee = await request.transaction.estimateTransactionFee();
        const usdFee = await fee.getUsdValue();

        const transactionFee: TransactionFeeData = {
            fee: fee.toString(4),
            usdFee: formatCurrencyValue(usdFee, 2),
            show: true,
        };

        if (request.account && request.transaction.getExpiration()) {
            transactionFee.show = false;
        }

        setTransactionFeeData(transactionFee);
        debug('fetchTransactionFee() done', transactionFee);
    }, [request]);

    const fetchTransactionTotal = useCallback(async () => {
        const account = await request.transaction.getFrom();
        const total = await request.transaction.estimateTransactionTotal();
        const usdTotal = await total.getUsdValue();
        let balanceError = false;

        const accountBalance = (await account.getBalance(chain.getNativeToken())).getAmount();

        if (accountBalance < total.getAmount()) {
            balanceError = true;
        }

        const transactionTotal = {
            show: true,
            total: total.toString(4),
            totalUsd: formatCurrencyValue(usdTotal, 2),
            balanceError,
        };

        if (request.account && request.transaction.getExpiration()) {
            transactionTotal.show = false;
        }

        setTransactionTotalData(transactionTotal);
        debug('fetchTransactionTotal() done', transactionTotal);
    }, [request]);

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

    const renderSignTransactionOriginDetails = () => {
        const origin = request.getOrigin();
        const showLogo = origin ? chain.getNativeToken().getLogoUrl() : Images.GetImage('logo1024');
        const appName = origin ? topLevelHostname : settings.config.appName;

        if (!origin && request.session) {
            return (
                <View style={styles.sandingMain}>
                    <Text style={[styles.sandingTitle, { textAlign: 'center' }]}>
                        A third-party app wants you to sign a transaction
                    </Text>
                </View>
            );
        }

        return (
            <>
                {!origin && !request.session ? (
                    <Image style={[styles.logo, commonStyles.marginBottom]} source={showLogo} />
                ) : (
                    <Image style={[styles.logo, commonStyles.marginBottom]} source={{ uri: showLogo }} />
                )}
                <View style={commonStyles.alignItemsCenter}>
                    <Text style={styles.applinkText}>{appName}</Text>
                    <Text style={styles.applinkContent}>wants you to sign a transaction</Text>
                </View>
            </>
        );
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            const expiration =
                request.transaction.getExpiration() && request.account ? request.transaction.getExpiration() : null;
            if (!expiration) {
                clearInterval(intervalId);
                return;
            }
            const now = new Date().getTime();
            const expirationTime = expiration.getTime();
            const timeDiff = expirationTime - now;
            if (timeDiff <= 0) {
                setRemainingTime('00:00');
                setExpired(true);
                clearInterval(intervalId);
            } else {
                const minutes = Math.floor(timeDiff / 1000 / 60);
                const seconds = Math.floor((timeDiff / 1000) % 60);
                setRemainingTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [request]);

    const renderExpirationTimer = () => {
        return !expired && request.account && transaction.getExpiration() ? (
            <View style={styles.expirationContainer}>
                <Text>Expiration time</Text>
                <Text>{remainingTime}</Text>
            </View>
        ) : null;
    };

    return (
        <LayoutComponent
            body={
                <ScrollView>
                    <View style={styles.container}>
                        {renderExpirationTimer()}
                        {renderSignTransactionOriginDetails()}
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
                                symbol={chainSymbol}
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
                    {(operations?.[0]?.contractName === 'eosio' || operations?.[0]?.contractName === 'tonomy') && (
                        <View style={{ marginTop: 16 }}>
                            {developerMode ? (
                                <View style={styles.developerModeOffView}>
                                    <Text style={styles.developerModeTitle}>Warning: This is a dangerous action</Text>
                                    <Text style={styles.developerModeContent}>
                                        Only sign the transaction if you understand the effect it will have on your
                                        account.
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.developerModeOnView}>
                                    <Text style={styles.developerModeTitle}>Blocked due to a security risk</Text>
                                    <Text style={styles.developerModeContent}>
                                        Enable developer mode in settings and to sign this transaction.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            }
            footer={
                <View style={{ marginTop: 30 }}>
                    {expired && chain.getChainType() === ChainType.ANTELOPE && (
                        <View style={styles.transactionExpiredView}>
                            <Text style={styles.transactionExpiredText}>
                                The transaction time has expired
                            </Text>
                            <Text>Please restart the transaction and try again.</Text>
                        </View>
                    )}
                    {!expired && (
                        <TButtonContained
                            disabled={
                                transactionLoading ||
                                transactionTotalData?.balanceError ||
                                ((operations?.[0]?.contractName === 'eosio' ||
                                    operations?.[0]?.contractName === 'tonomy') &&
                                    !developerMode)
                            }
                            onPress={() => onAccept()}
                            style={commonStyles.marginBottom}
                            size="large"
                        >
                            Sign Transaction
                        </TButtonContained>
                    )}
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
    symbol,
    transactionTotal,
    onTopUp,
}: {
    symbol: string;
    transactionTotal: TransactionTotalData;
    onTopUp: () => void;
}) {
    if (!transactionTotal.show) {
        return null;
    }
    return (
        <>
            <View
                style={[
                    styles.totalSection,
                    {
                        backgroundColor: transactionTotal.balanceError
                            ? theme.colors.errorBackground
                            : theme.colors.info,
                    },
                ]}
            >
                <View style={styles.totalView}>
                    <Text style={styles.totalTitle}>Total</Text>
                    <View style={styles.totalContentView}>
                        <Text style={styles.totalContent}>{transactionTotal.total}</Text>
                        <Text style={styles.secondaryColor}>(${transactionTotal.totalUsd})</Text>
                    </View>
                </View>
                {transactionTotal.balanceError && (
                    <Text style={styles.balanceError}>Not enough {symbol} on your balance</Text>
                )}
            </View>
            {transactionTotal.balanceError && (
                <View style={styles.topupView}>
                    <TButtonContained onPress={onTopUp} style={commonStyles.marginBottom} size="medium">
                        Top Up
                    </TButtonContained>
                </View>
            )}
        </>
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
        fontSize: 24,
        ...commonStyles.primaryFontFamily,
    },
    applinkContent: {
        marginLeft: 6,
        fontSize: 24,
        ...commonStyles.primaryFontFamily,
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
        ...commonStyles.secondaryFontFamily,
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
    expirationContainer: {
        backgroundColor: theme.colors.grey7,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 15,
        borderRadius: 6,
    },
    developerModeOnView: {
        padding: 16,
        borderRadius: 6,
        gap: 4,
        backgroundColor: theme.colors.errorBackground,
    },
    developerModeOffView: {
        padding: 16,
        borderRadius: 6,
        gap: 4,
        backgroundColor: theme.colors.warning,
    },
    developerModeTitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 19.36,
        letterSpacing: 0.16,
    },
    developerModeContent: {
        fontSize: 14,
        fontWeight: '400',
        letterSpacing: 0.16,
        lineHeight: 18,
    },
    transactionExpiredView: {
        backgroundColor: theme.colors.warning,
        padding: 16,
        borderRadius: 6,
        marginBottom: 15,
    },
    transactionExpiredText: {
        fontSize: 16,
        ...commonStyles.primaryFontFamily,
        marginBottom: 5,
    },
    topupView: {
        width: '100%',
        marginTop: 10,
    },
});
