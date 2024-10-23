import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SendAssetScreenNavigationProp } from '../screens/SendAssetScreen';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import ScanIcon from '../assets/icons/ScanIcon';
import ReceiverAccountScanner from '../components/ReceiverAccountScanner';
import { useEffect, useRef, useState } from 'react';
import { Images } from '../assets';
import { EthereumChain, EthereumPrivateKey, EthereumTransaction } from '../utils/chain/etherum';
import { ChainType, IChain, IPrivateKey, ITransaction } from '../utils/chain/types';
import { ethers } from 'ethers';
import useErrorStore from '../store/errorStore';
import { AccountDetails, getAssetDetails } from '../utils/tokenRegistry';
import Clipboard from '@react-native-clipboard/clipboard';
import TSpinner from '../components/atoms/TSpinner';
import { debounce } from '../utils/network';
import { AntelopeAccount, AntelopeChain, AntelopeTransaction } from '../utils/chain/antelope';

export type SendAssetProps = {
    navigation: SendAssetScreenNavigationProp['navigation'];
    chain: IChain;
    privateKey: IPrivateKey;
};

const SendAssetContainer = ({ chain, privateKey, navigation }: SendAssetProps) => {
    const [depositAccount, setScanQR] = useState<string>();
    const [balance, setBalance] = useState<string>();
    const [usdAmount, setUsdAmount] = useState<string>();
    const [asset, setAsset] = useState<AccountDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const refMessage = useRef<{ open: () => void; close: () => void }>(null);
    const errorStore = useErrorStore();
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const fetchAssetDetails = async () => {
            const assetData = await getAssetDetails(chain);

            setAsset(assetData);
            setLoading(false);
        };

        fetchAssetDetails();
    }, [chain]);

    if (loading || !asset || !asset.account) {
        return <TSpinner />;
    }

    const handleOpenQRScan = () => {
        refMessage?.current?.open();
    };

    const handlePaste = async () => {
        const content = await Clipboard.getString();

        if (chain.isValidAccountName(content)) {
            setScanQR(content);
        } else {
            errorStore.setError({
                error: new Error('The account you entered is invalid!'),
                title: 'Invalid account',
                expected: true,
            });
        }
    };

    const handleMaxAmount = () => {
        if (asset.balance) {
            setBalance(asset.balance);
            setUsdAmount(asset.usdBalance ? asset.usdBalance.toString() : '0');
        }
    };

    const onSendTransaction = async () => {
        setSubmitting(true);

        try {
            if (Number(asset.balance) < Number(balance) || Number(asset.balance) <= 0) {
                errorStore.setError({
                    error: new Error('You do not have enough balance to perform transaction!'),
                    expected: true,
                    title: 'Insufficient balance',
                });
                return;
            }

            let transaction: ITransaction;

            if (chain.getChainType() === ChainType.ETHEREUM) {
                const transactionData = {
                    to: depositAccount,
                    from: asset.account,
                    value: ethers.parseEther(balance ? balance.toString() : '0.00'),
                };

                transaction = await EthereumTransaction.fromTransaction(
                    privateKey as EthereumPrivateKey,
                    transactionData,
                    chain as EthereumChain
                );
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
                        to: depositAccount,
                        quantity: Number(balance).toFixed(asset.token.getPrecision()) + ' ' + asset.symbol,
                        memo: '',
                    },
                };

                transaction = AntelopeTransaction.fromActions(
                    [action],
                    chain as AntelopeChain,
                    AntelopeAccount.fromAccount(chain as AntelopeChain, asset.account)
                );
            }

            navigation.navigate('SignTransaction', {
                transaction,
                privateKey,
                session: null,
                origin: '',
                request: null,
            });
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

    return (
        <View style={styles.container}>
            <ReceiverAccountScanner onScanQR={setScanQR} chain={chain} refMessage={refMessage} />
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.flexCol}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={depositAccount}
                                style={styles.input}
                                placeholder="Enter or scan the account"
                                placeholderTextColor={theme.colors.tabGray}
                                onChangeText={setScanQR}
                                onEndEditing={(e) => {
                                    const account = e.nativeEvent.text;

                                    if (!chain.isValidAccountName(account)) {
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
                                    <ScanIcon color={theme.colors.success} width={18} height={18} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.networkContainer}>
                            <Image source={asset.icon || Images.GetImage('logo1024')} style={styles.favicon} />
                            <Text style={styles.networkName}>{asset.network} network</Text>
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
                                        <Text style={styles.currencyButtonText}>{asset.symbol}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.inputButton} onPress={handleMaxAmount}>
                                        <Text style={styles.inputButtonText}>MAX</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.inputHelp}>${Number(usdAmount) || '0.00'}</Text>
                        </View>
                    </View>
                </ScrollView>
                <View style={commonStyles.marginBottom}>
                    {submitting && (
                        <View style={commonStyles.marginBottom}>
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
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        color: theme.colors.secondary2,
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
        color: theme.colors.success,
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
});

export default SendAssetContainer;
