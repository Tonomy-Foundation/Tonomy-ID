import React, { useState, useRef } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { View, TouchableOpacity, StyleSheet, Image, Text, Platform, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Props } from '../screens/SignTransactionConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TH2 } from '../components/atoms/THeadings';
import { Images } from '../assets';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { approveEIP155Request, rejectEIP155Request } from '../utils/EIP155Request';
import { web3wallet } from '../utils/Web3WalletClient';

export default function SignTransactionConsentContainer({
    navigation,
    requestSession,
    requestEvent,
}: {
    navigation: Props['navigation'];
    requestSession: any;
    requestEvent: any;
}) {
    const [showDetails, setShowDetails] = useState(false);

    const refMessage = useRef(null);

    const chainID = requestEvent?.params?.chainId?.toUpperCase();
    const method = requestEvent?.params?.request?.method;

    const requestName = requestSession?.peer?.metadata?.name;
    const requestIcon = requestSession?.peer?.metadata?.icons[0];
    const requestURL = requestSession?.peer?.metadata?.url;

    const { topic, params } = requestEvent;
    const { request, chainId } = params;
    const transaction = request.params[0];

    async function onReject() {
        if (requestEvent) {
            const response = rejectEIP155Request(requestEvent);

            await web3wallet.respondSessionRequest({
                topic,
                response,
            });
        }
    }

    console.log('chainId', chainID, method, requestName, requestIcon, requestURL, topic, params, transaction);
    return (
        <LayoutComponent
            body={
                <ScrollView>
                    <View style={styles.container}>
                        <Image style={[styles.logo, commonStyles.marginBottom]} source={requestIcon}></Image>
                        <TH2 style={[commonStyles.textAlignCenter, styles.padding]}>
                            <Text style={styles.applink}>{requestURL}</Text>
                            wants you to send coins
                        </TH2>
                        <View style={styles.networkHeading}>
                            <Image source={require('../assets/icons/eth-img.png')} style={styles.imageStyle} />
                            <Text style={styles.nameText}>Ethereum Network</Text>
                        </View>
                        <View style={styles.transactionHeading}>
                            <Text>
                                {transaction.from.substring(0, 7)}....
                                {transaction.from.substring(transaction.from.length - 6)}
                            </Text>
                        </View>
                        <View style={styles.appDialog}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.secondaryColor}>Recipient:</Text>
                                <Text>
                                    {' '}
                                    {transaction.to.substring(0, 7)}....
                                    {transaction.to.substring(transaction.from.length - 6)}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                                <Text style={styles.secondaryColor}>Amount:</Text>
                                <Text>
                                    {transaction.value} Eth <Text style={styles.secondaryColor}>($117.02) </Text>
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
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
                                            icon={Platform.OS === 'android' ? 'arrow-down' : 'chevron-down'}
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
                            {showDetails && (
                                <View style={styles.detailSection}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={styles.secondaryColor}>Price:</Text>
                                        <Text>
                                            0.001 Eth <Text style={styles.secondaryColor}>($17.02) </Text>
                                        </Text>
                                    </View>
                                    <View
                                        style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}
                                    >
                                        <Text style={styles.secondaryColor}>NFT ID:</Text>
                                        <Text>#89792 </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => (refMessage.current as any)?.open()}>
                                        <Text style={styles.rawTransaction}>Show raw transaction</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <View style={styles.appDialog}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.secondaryColor}>Gas fee:</Text>
                                <Text>
                                    {transaction.gasPrice} Eth <Text style={styles.secondaryColor}>($17.02) </Text>
                                </Text>
                            </View>
                        </View>
                        <View style={styles.totalSection}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ marginRight: 8, fontWeight: '600' }}>Total:</Text>
                                <Text style={{ fontWeight: '600' }}>0x9523a2....5c4bafe5</Text>
                            </View>
                        </View>

                        <RBSheet ref={refMessage} openDuration={150} closeDuration={100} height={600}>
                            <View style={styles.rawTransactionDrawer}>
                                <Text style={styles.drawerHead}>Show raw transaction!</Text>
                                <Text style={styles.drawerParagragh}>
                                    {`contract VendingMachine { // Declare state variables of the contract address public owner; mapping (address => uint) public cupcakeBalances; // When 'VendingMachine' contract is deployed: // 1. set the deploying address as the owner of the contract // 2. set the deployed smart contract's cupcake balance to 100 constructor() { owner = msg.sender; cupcakeBalances[address(this)] = 100; } // Allow the owner to increase the smart contract's cupcake balance function refill(uint amount) public { require(msg.sender == owner, "Only the owner can refill."); cupcakeBalances[address(this)] += amount; } // Allow anyone to purchase cupcakes function purchase(uint amount) public payable { require(msg.value >= amount * 1 ether, "You must pay at least 1 ETH per cupcake"); require(cupcakeBalances[address(this)] >= amount, "Not enough cupcakes in stock to complete this purchase"); cupcakeBalances[address(this)] -= amount; cupcakeBalances[msg.sender] += amount; } }`}
                                </Text>
                            </View>
                        </RBSheet>
                    </View>
                </ScrollView>
            }
            footer={
                <View style={{ marginTop: 30 }}>
                    <TButtonContained style={commonStyles.marginBottom}>Proceed</TButtonContained>
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
