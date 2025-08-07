import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SendAssetScreenNavigationProp } from '../screens/SendAssetScreen';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import ScanIcon from '../assets/icons/ScanIcon';
import ReceiverAccountScanner from '../components/ReceiverAccountScanner';
import { useEffect, useRef, useState } from 'react';
import { ChainType, IChain, IPrivateKey, ITransaction } from '../utils/chain/types';
import { ethers } from 'ethers';
import useErrorStore from '../store/errorStore';
import { AccountTokenDetails, getAssetDetails } from '../utils/tokenRegistry';
import Clipboard from '@react-native-clipboard/clipboard';
import TSpinner from '../components/atoms/TSpinner';
import { debounce } from '../utils/network';
import { AntelopeAccount, AntelopeChain, AntelopePrivateKey, AntelopeTransaction } from '../utils/chain/antelope';
import { WalletTransactionRequest } from '../utils/session/walletConnect';
import { AntelopeTransactionRequest } from '../utils/session/antelope';
import settings from '../settings';
import LayoutComponent from '../components/layout';
import TInfoModalBox from '../components/TInfoModalBox';
import TInputTextBox from '../components/TInputTextBox';

export type SendAssetProps = {
    navigation: SendAssetScreenNavigationProp['navigation'];
    chain: IChain;
    privateKey: IPrivateKey;
};

const SendAssetContainer = ({ chain, privateKey, navigation }: SendAssetProps) => {
    const [depositAccount, setDepositAccount] = useState<string>();
    const [balance, setBalance] = useState<string>();
    const [availableBalance, setAvailableBalance] = useState<string>();
    const [memo, setMemo] = useState<string>();

    const [usdAmount, setUsdAmount] = useState<string>();
    const [asset, setAsset] = useState<AccountTokenDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const refMessage = useRef<{ open: () => void; close: () => void }>(null);
    const errorStore = useErrorStore();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const token = chain.getNativeToken();

    useEffect(() => {
        const fetchAssetDetails = async () => {
            try {
                const assetData = await getAssetDetails(chain);

                setAsset(assetData);
                setLoading(false);
            } catch (error) {
                errorStore.setError({
                    error,
                    expected: false,
                });
            }
        };

        fetchAssetDetails();
    }, [chain, errorStore]);

    if (loading || !asset || !asset.account) {
        return <TSpinner />;
    }

    const handleOpenQRScan = () => {
        refMessage?.current?.open();
    };

    const handlePaste = async () => {
        const content = await Clipboard.getString();

        if (chain.isValidAccountName(content)) {
            setDepositAccount(content);
        } else {
            errorStore.setError({
                error: new Error('The account you entered is invalid!'),
                title: 'Invalid account',
                expected: true,
            });
        }
    };

    const handleMaxAmount = async () => {
        if (token.getSymbol() === settings.config.currencySymbol) {
            const account = AntelopeAccount.fromAccount(chain as AntelopeChain, asset.account);
            const availableBalance = await token.getAvailableBalance(account);
            const balance = availableBalance.toString().split(' ')[0];
            const formatBalance = Number(balance?.replace(/,/g, '')).toString();

            setAvailableBalance(formatBalance);
            setBalance(formatBalance);
            setUsdAmount((await availableBalance.getUsdValue()).toString());
        } else if (asset.token.balance) {
            setBalance(asset.token.balance);
            setUsdAmount(asset.token.usdBalance ? asset.token.usdBalance.toString() : '0');
        }
    };

    const throwErrorMsg = () => {
        errorStore.setError({
            error: new Error('You do not have enough balance to perform transaction!'),
            expected: true,
            title: 'Insufficient balance',
        });
        setSubmitting(false);
    };

    const onSendTransaction = async () => {
        setSubmitting(true);

        if (!depositAccount) throw new Error('Deposit account is required');

        try {
            if (
                Number(asset.token.balance) < Number(balance) ||
                Number(asset.token.balance) <= 0 ||
                Number(balance) <= 0
            ) {
                throwErrorMsg();
                return;
            }

            if (token.getSymbol() === settings.config.currencySymbol && Number(balance) > Number(availableBalance)) {
                throwErrorMsg();
                return;
            }

            let transaction: ITransaction;

            if (chain.getChainType() === ChainType.ETHEREUM) {
                const transactionData = {
                    to: depositAccount.toLowerCase(),
                    from: asset.account,
                    value: ethers.parseEther(balance ? balance.toString() : '0.00'),
                };

                const transactionRequest = await WalletTransactionRequest.fromTransaction(
                    transactionData,
                    privateKey,
                    chain
                );

                navigation.navigate('SignTransaction', {
                    request: transactionRequest,
                });
            } else {
                const action = {
                    account: 'eosio.token',
                    name: 'transfer',
                    authorization: [
                        {
                            actor: asset.account,
                            permission: 'active',
                        },
                    ],
                    data: {
                        from: asset.account,
                        to: depositAccount.toLowerCase(),
                        quantity: Number(balance).toFixed(asset.token.precision) + ' ' + asset.token.symbol,
                        memo: memo || '',
                    },
                };

                transaction = AntelopeTransaction.fromActions(
                    [action],
                    chain as AntelopeChain,
                    AntelopeAccount.fromAccount(chain as AntelopeChain, asset.account)
                );

                const request = await AntelopeTransactionRequest.fromTransaction(
                    transaction as AntelopeTransaction,
                    privateKey as AntelopePrivateKey
                );

                navigation.navigate('SignTransaction', {
                    request,
                });
            }
        } catch (error) {
            errorStore.setError({
                error,
                expected: false,
            });
        } finally {
            setSubmitting(false);
        }
    };
    const fetchPrice = async (amount) => {
        const price = await chain.getNativeToken().getUsdPrice();

        const usdAmount = Number(amount) * Number(price);

        setUsdAmount(usdAmount.toFixed(4));
    };

    const debouncedSearch = debounce(fetchPrice, 500);

    const onAmountChange = async (amount) => {
        setBalance(amount);
        debouncedSearch(amount);
    };

    const logo = asset.token.icon;

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <ReceiverAccountScanner onScanQR={setDepositAccount} chain={chain} refMessage={refMessage} />
                    <View style={styles.content}>
                        <ScrollView contentContainerStyle={styles.scrollViewContent}>
                            <View style={styles.flexCol}>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        value={depositAccount}
                                        style={styles.input}
                                        placeholder="Enter or scan the account"
                                        placeholderTextColor={theme.colors.tabGray}
                                        onChangeText={setDepositAccount}
                                        onEndEditing={(e) => {
                                            const account = e.nativeEvent.text;

                                            if (!chain.isValidAccountName(account.toLowerCase())) {
                                                errorStore.setError({
                                                    error: new Error('The account you entered is invalid'),
                                                    title: 'Invalid account',
                                                    expected: true,
                                                });
                                            }
                                        }}
                                    />
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity style={styles.inputButton} onPress={handlePaste}>
                                            <Text style={styles.inputButtonText}>Paste</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.inputButton} onPress={handleOpenQRScan}>
                                            <ScanIcon color={theme.colors.primary} width={18} height={18} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.networkContainer}>
                                    <Image
                                        source={typeof logo === 'string' ? { uri: logo } : logo}
                                        style={styles.favicon}
                                    />
                                    <Text style={styles.networkName}>{asset.chain.getName()} network</Text>
                                </View>
                                <View>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            defaultValue={balance}
                                            style={styles.input}
                                            placeholder="Enter amount"
                                            placeholderTextColor={theme.colors.tabGray}
                                            onChangeText={onAmountChange}
                                        />
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            <TouchableOpacity style={styles.inputButton}>
                                                <Text style={styles.currencyButtonText}>{asset.token.symbol}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.inputButton} onPress={handleMaxAmount}>
                                                <Text style={styles.inputButtonText}>MAX</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Text style={styles.inputHelp}>${Number(usdAmount) || '0.00'}</Text>
                                </View>
                            </View>
                            <Text style={styles.inputHelp}>${Number(usdAmount) || '0.00'}</Text>
                        </ScrollView>
                        <View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    defaultValue={memo}
                                    style={styles.input}
                                    placeholder="Memo"
                                    placeholderTextColor={theme.colors.tabGray}
                                    onChangeText={(v) => setMemo(v)}
                                />
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    <Text style={styles.inputButton}>
                                        <Text style={styles.currencyButtonText}>Optional</Text>
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            }
            footerHint={
                <View style={styles.infoBox}>
                    <TInfoModalBox
                        description="Tonomy Network currently scales to over 15,000 transactions per second"
                        modalTitle="Built to scale fast"
                        modalDescription="Tonomy is built for performance — powering over 15,000 transactions per second and 500 millisecond latency. From verifying identity to signing requests, everything happens in real time. No lag, no slowdowns, no limits. Whether you're just starting out or scaling to millions, Tonomy keeps up — effortlessly"
                    />
                </View>
            }
            footer={
                <View style={commonStyles.marginBottom}>
                    {submitting && (
                        <View style={[commonStyles.marginBottom, styles.proceedLoader]}>
                            <TSpinner />
                        </View>
                    )}
                    <TButtonContained
                        disabled={!depositAccount || !balance || submitting}
                        style={commonStyles.marginBottom}
                        size="large"
                        onPress={onSendTransaction}
                    >
                        Proceed
                    </TButtonContained>
                </View>
            }
        ></LayoutComponent>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    infoBox: {
        marginBottom: 32,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    networkContainer: {
        backgroundColor: theme.colors.grey7,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        height: 48,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 8,
    },
    networkName: {
        fontSize: 15,
    },
    favicon: {
        width: 24,
        height: 24,
    },
    appDialog: {
        borderWidth: 1,
        borderColor: theme.colors.grey5,
        borderStyle: 'solid',
        borderRadius: 7,
        padding: 14,
        width: '100%',
        marginTop: 10,
    },
    secondaryColor: {
        color: theme.colors.grey9,
        marginLeft: 4,
    },
    inputContainer: {
        borderColor: theme.colors.grey8,
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    input: {
        height: 48,
        width: '100%',
        padding: 10,
        fontSize: 15,
        flexShrink: 1,
    },
    inputButton: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginRight: 10,
        flexShrink: 0,
    },
    currencyButtonText: {
        color: theme.colors.grey9,
        fontSize: 15,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    inputButtonText: {
        color: theme.colors.primary,
        fontSize: 15,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    inputHelp: {
        marginTop: 5,
        fontSize: 15,
        color: theme.colors.tabGray,
        ...commonStyles.secondaryFontFamily,
    },
    flexCol: {
        flexDirection: 'column',
        gap: 15,
    },
    proceedLoader: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SendAssetContainer;
