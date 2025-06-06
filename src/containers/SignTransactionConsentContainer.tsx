import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { Props } from '../screens/SignTransactionConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { IOperation, ITransactionRequest, TransactionType, ChainType, Asset } from '../utils/chain/types';
import { extractHostname } from '../utils/network';
import { formatCurrencyValue } from '../utils/numbers';
import useErrorStore from '../store/errorStore';
import Debug from 'debug';
import AccountDetails from '../components/AccountDetails';
import {
    isFree,
    OperationData,
    Operations,
    showFee,
    TransactionFee,
    TransactionFeeData,
} from '../components/Transaction';
import TSpinner from '../components/atoms/TSpinner';
import { ApplicationError, ApplicationErrors } from '../utils/errors';

import settings from '../settings';
import useAppSettings from '../store/useAppSettings';
import { captureError } from '../utils/sentry';
import { ETHSepoliaToken, ETHToken } from '../utils/chain/etherum';

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
    const { developerMode } = useAppSettings();

    const getOperationData = useCallback(
        async (operation: IOperation) => {
            const type = await operation.getType();

            if (type === TransactionType.TRANSFER) {
                const to = chain.formatShortAccountName((await operation.getTo()).getName());
                const value = await operation.getValue();
                const amount = value.toString();

                const usdValue = formatCurrencyValue(await value.getUsdValue());

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

    const fetchTransactionFee = useCallback(
        async (operations: OperationData[]) => {
            const fee = await request.transaction.estimateTransactionFee();
            const usdFee = await fee.getUsdValue();

            const transactionFee: TransactionFeeData = {
                fee: fee,
                usdFee: usdFee,
                show: showFee(operations, fee, usdFee),
                isFree: isFree(fee, usdFee),
            };

            setTransactionFeeData(transactionFee);
            debug('fetchTransactionFee() done', transactionFee);
        },
        [request]
    );

    const fetchTransactionTotal = useCallback(
        async (operations: OperationData[]) => {
            const account = await request.transaction.getFrom();
            const total = await request.transaction.estimateTransactionTotal();
            const usdTotal = await total.getUsdValue();
            let balanceError = false;

            const accountBalance = (await account.getBalance(chain.getNativeToken())).getAmount();

            if (accountBalance.lessThan(total.getAmount())) {
                balanceError = true;
            }

            const transactionTotal = {
                show: showFee(operations, total, usdTotal),
                total: total.toString(),
                totalUsd: formatCurrencyValue(usdTotal),
                balanceError,
            };

            setTransactionTotalData(transactionTotal);
            debug('fetchTransactionTotal() done', transactionTotal);
        },
        [chain, request]
    );

    const fetchOperations = useCallback(async () => {
        let syncedOperations: OperationData[];

        if (transaction.hasMultipleOperations()) {
            const operations = await transaction.getOperations();

            syncedOperations = await Promise.all(operations.map(getOperationData));
        } else {
            syncedOperations = [await getOperationData(transaction)];
        }

        setOperations(syncedOperations);
        debug('fetchOperations() done', syncedOperations);
        await Promise.all([fetchTransactionFee(syncedOperations), fetchTransactionTotal(syncedOperations)]);
    }, [transaction, getOperationData, fetchTransactionFee, fetchTransactionTotal]);

    useEffect(() => {
        async function fetchTransactionData() {
            try {
                setTransactionLoading(true);
                await Promise.all([fetchAccountName(), fetchOperations()]);
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
    }, [fetchAccountName, fetchOperations, errorStore]);

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
                receipt,
                request,
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

    const SignTransactionOriginDetails = () => {
        const origin = request.getOrigin();
        const hostname = origin ? extractHostname(origin) : null;

        function Logo() {
            // https://clearbit.com/blog/logo
            const logo = origin ? `https://logo.clearbit.com/${hostname}` : chain.getNativeToken().getLogoUrl();

            try {
                return <Image style={styles.logo} source={typeof logo === 'string' ? { uri: logo } : logo} />;
            } catch (error) {
                captureError(`Failed to load logo: ${logo}`, error);
                return null;
            }
        }

        function Message() {
            if (!origin && request.session) {
                return (
                    <>
                        <View style={styles.sandingMain}>
                            <Text style={[styles.sandingTitle, { textAlign: 'center' }]}>
                                A third-party app wants you to sign a transaction
                            </Text>
                        </View>
                    </>
                );
            } else {
                const topLevelHostname = hostname ? hostname.split('.').slice(-2).join('.') : null;
                const appName = origin ? topLevelHostname : settings.config.appName;

                return (
                    <>
                        <View style={commonStyles.alignItemsCenter}>
                            <Text style={styles.applinkText}>{appName}</Text>
                            <Text style={styles.applinkContent}>wants you to sign a transaction</Text>
                        </View>
                    </>
                );
            }
        }

        return (
            <>
                <Logo />
                <Message />
            </>
        );
    };

    useEffect(() => {
        const expiration =
            request.transaction.getExpiration() && request.account ? request.transaction.getExpiration() : null;
        const intervalId = setInterval(() => {
            if (!expiration) {
                clearInterval(intervalId);
                return;
            }

            const now = new Date().getTime();
            const expirationTime = expiration.getTime();
            const timeDiff = expirationTime - now;
            const remainingCounter = Math.floor((expirationTime - now) / 1000);

            if (remainingCounter < 0) {
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

    const ExpirationTimer = () => {
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
                        <ExpirationTimer />
                        <SignTransactionOriginDetails />
                        <View style={styles.networkHeading}>
                            <Image
                                source={typeof chainIcon === 'string' ? { uri: chainIcon } : chainIcon}
                                style={styles.imageStyle}
                                resizeMode="contain"
                            />

                            <Text style={styles.nameText}>{chainName} Network</Text>
                        </View>
                        {!accountName && <TSpinner />}
                        {accountName && <TransactionAccount accountName={accountName} />}
                        {!operations && <TSpinner />}
                        {operations && <Operations operations={operations} />}
                        {!transactionFeeData && <TSpinner />}
                        {transactionFeeData && (
                            <TransactionFee
                                transactionFee={transactionFeeData}
                                precision={chain.getNativeToken().getPrecision()}
                            />
                        )}
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
                    {expired && chain.getChainType() === ChainType.ANTELOPE && !transactionLoading && (
                        <View style={styles.transactionExpiredView}>
                            <Text style={styles.transactionExpiredText}>The transaction time has expired</Text>
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
        // borderRadius: 50,
    },
    applinkText: {
        color: theme.colors.linkColor,
        margin: 0,
        padding: 2,
        fontSize: 24,
        ...commonStyles.primaryFontFamily,
    },
    applinkContent: {
        textAlign: 'center',
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
        width: 20,
        height: 18,
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
        color: theme.colors.grey9,
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
        color: theme.colors.grey9,
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
