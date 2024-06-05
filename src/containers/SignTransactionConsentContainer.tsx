import React, { useState, useRef, useEffect } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { View, TouchableOpacity, StyleSheet, Image, Text, Platform, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Props } from '../screens/SignTransactionConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TH2 } from '../components/atoms/THeadings';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { web3wallet, rejectRequest } from '../services/WalletConnect/WalletConnectModule';
import { SignClientTypes } from '@walletconnect/types';
import { IChain, ITransaction, TransactionType } from '../utils/chain/types';
import { EthereumTransaction, EthereumMainnetChain, EthereumSepoliaChain } from '../utils/chain/etherum';
import { extractOrigin, formatAccountAddress } from '../utils/helper';
import TSpinner from '../components/atoms/TSpinner';
import { TransactionRequest } from 'ethers';
import { keyStorage } from '../utils/StorageManager/setup';
import settings from '../settings';

export default function SignTransactionConsentContainer({
    navigation,
    requestEvent,
}: {
    navigation: Props['navigation'];
    requestEvent: SignClientTypes.EventArguments['session_request'];
}) {
    const [contractTransaction, setContractTransaction] = useState(false);
    const [loading, setLoading] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<{
        transactionType: TransactionType | null;
        fromAccount: string;
        toAccount: string;
        value: bigint;
        usdValue: number;
        functionName: string;
        args: Record<string, string> | null;
        fee: bigint;
        usdFee: number;
        total: bigint;
        usdTotal: number;
    }>({
        transactionType: null,
        fromAccount: '',
        toAccount: '',
        value: BigInt(0),
        usdValue: 0,
        functionName: '',
        args: {},
        fee: BigInt(0),
        usdFee: 0,
        total: BigInt(0),
        usdTotal: 0,
    });
    const refMessage = useRef(null);
    const { params, topic, id } = requestEvent;

    const requestSession = web3wallet?.engine.signClient.session.get(topic);

    const { name: requestName, icons: [requestIcon] = [], url: requestURL } = requestSession?.peer?.metadata ?? {};

    const { request } = params;
    const transactionData = request.params[0];
    let ethereumChain;

    if (settings.env === 'production') {
        ethereumChain = EthereumMainnetChain;
    } else {
        ethereumChain = EthereumSepoliaChain;
    }

    useEffect(() => {
        const transaction: ITransaction = new EthereumTransaction(transactionData, ethereumChain);

        const fetchTransactionDetails = async () => {
            try {
                setLoading(true);
                setContractTransaction(true);

                const fromAccount = await transaction.getFrom().getName();
                const toAccount = await transaction.getTo().getName();
                const value = (await transaction.getValue()).getAmount();
                const usdValue = await (await transaction.getValue()).getUsdValue();
                const fee = (await transaction.estimateTransactionFee()).getAmount();
                const usdFee = await (await transaction.estimateTransactionFee()).getUsdValue();
                const total = (await transaction.estimateTransactionTotal()).getAmount();
                const usdTotal = await (await transaction.estimateTransactionTotal()).getUsdValue();

                const transactionType = await transaction.getType();
                let functionName = '';
                let args: Record<string, string> | null = null;

                if (!contractTransaction) {
                    functionName = await transaction.getFunction();
                    args = await transaction.getArguments();
                }

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
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [transactionData, ethereumChain, contractTransaction]);

    async function onReject() {
        if (requestEvent) {
            const response = rejectRequest(requestEvent);

            await web3wallet?.respondSessionRequest({
                topic,
                response,
            });
            navigation.navigate({
                name: 'UserHome',
                params: {},
            });
        }
    }

    async function onAccept() {
        if (requestEvent) {
            const privateKeyValue = await keyStorage.findByName('ethereum');

            if (privateKeyValue) {
                const transactionRequest: TransactionRequest = {
                    to: transactionDetails.toAccount,
                    from: transactionDetails.fromAccount,
                    value: transactionDetails.value,
                    chainId: ethereumChain.getChainId(),
                    gasPrice: transactionDetails.fee,
                };
                const signedTransaction = await privateKeyValue.signTransaction(transactionRequest);

                // Wait for the transaction to be mined
                const response = { id, result: signedTransaction, jsonrpc: '2.0' };

                await web3wallet?.respondSessionRequest({ topic, response });
                navigation.navigate({
                    name: 'UserHome',
                    params: {},
                });
            } else {
                throw new Error('No private key found');
            }
        }
    }

    return (
        <LayoutComponent
            body={
                <ScrollView>
                    <View style={styles.container}>
                        <Image style={[styles.logo, commonStyles.marginBottom]} source={{ uri: requestIcon }}></Image>
                        <TH2 style={[commonStyles.textAlignCenter, styles.padding]}>
                            <Text style={styles.applink}>{extractOrigin(requestURL)}</Text>
                            wants you to send coins
                        </TH2>
                        {!loading ? (
                            <>
                                <View style={styles.networkHeading}>
                                    <Image source={require('../assets/icons/eth-img.png')} style={styles.imageStyle} />
                                    <Text style={styles.nameText}>Ethereum Network</Text>
                                    <Text>{formatAccountAddress(transactionDetails?.fromAccount)} </Text>
                                </View>
                                <View style={styles.transactionHeading}></View>
                                <View style={styles.appDialog}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={styles.secondaryColor}>Recipient:</Text>
                                        <Text>{formatAccountAddress(transactionDetails?.toAccount)} </Text>
                                    </View>
                                    <View
                                        style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}
                                    >
                                        <Text style={styles.secondaryColor}>Amount:</Text>
                                        <Text>
                                            {transactionDetails?.value} Eth
                                            <Text style={styles.secondaryColor}>(${transactionDetails.usdValue}) </Text>
                                        </Text>
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
                                        <Text>
                                            {transactionDetails?.fee} Eth
                                            <Text style={styles.secondaryColor}>(${transactionDetails.usdFee}) </Text>
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.totalSection}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ marginRight: 8, fontWeight: '600' }}>Total:</Text>
                                        <Text style={{ fontWeight: '600' }}>
                                            {transactionDetails?.total} ETH
                                            <Text style={styles.secondaryColor}>(${transactionDetails.usdTotal}) </Text>
                                        </Text>
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
        width: 70,
        height: 70,
    },
    applink: {
        color: theme.colors.linkColor,
        margin: 0,
        padding: 0,
        marginRight: 2,
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
