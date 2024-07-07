import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { Props } from '../screens/SignTransactionConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { TH2 } from '../components/atoms/THeadings';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { IPrivateKey, ITransaction, TransactionType } from '../utils/chain/types';
import { extractOrigin } from '../utils/helper';
import TSpinner from '../components/atoms/TSpinner';
import { TransactionRequest } from 'ethers';
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

                console.log('fromAccount', fromAccount);
                const toAccount = await transaction.getTo().getName();

                console.log('toAccount', toAccount);
                const value = (await transaction.getValue()).toString();

                console.log('value', value);
                const usdValue = await (await transaction.getValue()).getUsdValue();

                console.log('usdValue', usdValue);

                const fee = (await transaction.estimateTransactionFee())?.toString();

                console.log('fee', fee);
                // const usdFee = fee ? await (await transaction.estimateTransactionFee()).getUsdValue() : 0;

                // console.log('usdFee', usdFee);
                // const total = (await transaction.estimateTransactionTotal())?.toString();

                // const usdTotal = total
                //     ? await (await transaction.estimateTransactionTotal()).getToken()?.getUsdPrice()
                //     : 0;

                // const transactionType = await transaction.getType();
                // let functionName = '';
                // let args: Record<string, string> | null = null;

                // if (contractTransaction) {
                //     functionName = await transaction.getFunction();
                //     args = await transaction.getArguments();
                // }

                // setLoading(false);
                // setTransactionDetails({
                //     transactionType,
                //     fromAccount,
                //     toAccount,
                //     value,
                //     usdValue,
                //     functionName,
                //     args,
                //     fee,
                //     usdFee,
                //     total,
                //     usdTotal,
                // });
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
                to: transactionDetails.toAccount,
                from: transactionDetails.fromAccount,
                value: transactionDetails.value,
                chainId: transaction.getChain().getChainId(),
                gasPrice: transactionDetails.fee,
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
                        <TH2 style={[commonStyles.textAlignCenter, styles.padding]}>
                            <Text style={styles.applink}>{extractOrigin(session?.origin)}</Text>
                            wants you to send coins
                        </TH2>

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
