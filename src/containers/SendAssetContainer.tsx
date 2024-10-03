import {
    Image,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SendAssetScreenNavigationProp } from '../screens/SendAssetScreen';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import ScanIcon from '../assets/icons/ScanIcon';
import QRScan from '../components/QRScan';
import { useEffect, useRef, useState } from 'react';

import { Images } from '../assets';
import { EthereumChain, EthereumPrivateKey, EthereumTransaction } from '../utils/chain/etherum';
import { IChain, IPrivateKey, ITransaction } from '../utils/chain/types';
import { ethers } from 'ethers';
import useErrorStore from '../store/errorStore';
import { getAssetDetails } from '../utils/assetDetails';
import Clipboard from '@react-native-clipboard/clipboard';

export type SendAssetProps = {
    navigation: SendAssetScreenNavigationProp['navigation'];
    network: string;
    chain: IChain;
    privateKey: IPrivateKey;
};

const SendAssetContainer = (props: SendAssetProps) => {
    const [depositeAddress, onChangeAddress] = useState<string>();
    const [amount, onChangeAmount] = useState<string>();
    const [usdAmount, onChangeUSDAmount] = useState<string>();
    const [disabled, setDisabled] = useState<boolean>(false);
    const [asset, setAsset] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const refMessage = useRef(null);
    const errorStore = useErrorStore();

    useEffect(() => {
        const fetchAssetDetails = async () => {
            const assetData = await getAssetDetails(props.network);

            setAsset(assetData);
        };

        fetchAssetDetails();
    }, [props.network]);

    if (loading) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        );
    }

    const handleOpenQRScan = () => {
        (refMessage?.current as any)?.open();
    };

    const isValidCryptoAddress = (input) => {
        const regex = /^0x[a-fA-F0-9]{40}$/;

        return regex.test(input);
    };

    const handlePaste = async () => {
        const content = await Clipboard.getString();

        if (isValidCryptoAddress(content)) {
            onChangeAddress(content);
        } else {
            onChangeAddress('');
            errorStore.setError({
                error: new Error('Invalid address!'),
                expected: true,
            });
        }
    };

    const onClose = () => {
        (refMessage.current as any)?.close();
    };

    const onScan = (address) => {
        onChangeAddress(address);
        onClose();
    };

    const getBalance = () => {
        if (asset && asset.balance) {
            return asset.balance.replace(asset.symbol, '')?.trim();
        }
    };

    const handleMaxAmount = () => {
        const balance = getBalance();

        if (balance !== '0') {
            onChangeAmount(balance);
            onChangeUSDAmount(asset.usdBalance ? asset.usdBalance.toString() : '0');
        } else {
            onChangeAmount('');
            onChangeUSDAmount('0');
            errorStore.setError({
                error: new Error('done'),
                expected: true,
            });
            return;
        }
    };
    const getTransactionAmount = (currencySymbol, amount) => {
        if (currencySymbol === 'ETH' || currencySymbol === 'SepoliaETH' || currencySymbol === 'MATIC') {
            return ethers.parseEther(amount.toString());
        }

        throw new Error('Unsupported currency symbol');
    };

    const handleSendTransaction = async () => {
        if (asset.symbol !== 'LEOS') {
            if (!depositeAddress) {
                errorStore.setError({
                    error: new Error('Transaction has no recipient'),
                    expected: true,
                });
                return;
            }

            if (!amount) {
                errorStore.setError({
                    error: new Error('Transaction has no amount'),
                    expected: true,
                });
                return;
            }

            const balance = getBalance();

            if (balance && Number(balance) < Number(amount)) {
                errorStore.setError({
                    error: new Error('Insufficient balance in account'),
                    expected: true,
                });
                return;
            }

            setDisabled(true);
            const transactionData = {
                to: depositeAddress,
                from: asset.account,
                value: amount.toString(),
            };

            let transaction: ITransaction;
            const key = props.privateKey;
            const chain = props.chain as EthereumChain;

            if (key) {
                const exportPrivateKey = await key.exportPrivateKey();
                const ethereumPrivateKey = new EthereumPrivateKey(exportPrivateKey, chain);

                transaction = await EthereumTransaction.fromTransaction(ethereumPrivateKey, transactionData, chain);
                setDisabled(false);
                props.navigation.navigate('SignTransaction', {
                    transaction,
                    privateKey: key,
                    session: null,
                    origin: '',
                    request: null,
                });
            }
        }
    };

    const fetchEthPrice = async (amount) => {
        try {
            const response = await fetch('https://pangea-sales-api-yx37y.ondigitalocean.app/crypto?symbol=ETH');
            const data = await response.json();
            const ethPrice = data.usd;
            const usdAmount = Number(amount) * Number(ethPrice);

            onChangeUSDAmount(usdAmount.toFixed(2));
        } catch (error) {
            console.error('Error fetching ETH price:', error);
        }
    };

    const debounce = (func, delay) => {
        let timeoutId;

        return (...args) => {
            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    const debouncedSearch = debounce(fetchEthPrice, 500);

    const handleAmountChange = async (amount) => {
        onChangeAmount(amount);
        debouncedSearch(amount);
    };

    return (
        <View style={styles.container}>
            <QRScan onClose={onClose} cryptoWallet onScan={onScan} refMessage={refMessage} />
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.flexCol}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={depositeAddress}
                                style={styles.input}
                                placeholder="Enter or scan the address"
                                placeholderTextColor={theme.colors.tabGray}
                                onChangeText={onChangeAddress}
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
                                    defaultValue={amount}
                                    style={styles.input}
                                    placeholder="Enter amount"
                                    placeholderTextColor={theme.colors.tabGray}
                                    onChangeText={handleAmountChange}
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
                    <TButtonContained
                        disabled={disabled}
                        style={commonStyles.marginBottom}
                        size="large"
                        onPress={handleSendTransaction}
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
