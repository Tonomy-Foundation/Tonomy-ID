import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SendAssetScreenNavigationProp } from '../screens/SendAssetScreen';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import ScanIcon from '../assets/icons/ScanIcon';
import QRScan from '../components/QRScan';
import { useEffect, useRef, useState } from 'react';

import { Images } from '../assets';
import { EthereumChain, EthereumPrivateKey, EthereumTransaction } from '../utils/chain/etherum';
import { ChainType, IChain, IPrivateKey, ITransaction } from '../utils/chain/types';
import { ethers } from 'ethers';
import useErrorStore from '../store/errorStore';
import { AccountDetails, getAssetDetails } from '../utils/assetDetails';
import Clipboard from '@react-native-clipboard/clipboard';
import Loader from '../components/Loader';

export type SendAssetProps = {
    navigation: SendAssetScreenNavigationProp['navigation'];
    chain: IChain;
    privateKey: IPrivateKey;
};

const SendAssetContainer = (props: SendAssetProps) => {
    const [depositeAddress, onChangeAddress] = useState<string>();
    const [amount, onChangeAmount] = useState<string>();
    const [usdAmount, onChangeUSDAmount] = useState<string>();
    const [asset, setAsset] = useState<AccountDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const refMessage = useRef(null);
    const errorStore = useErrorStore();
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const fetchAssetDetails = async () => {
            const assetData = await getAssetDetails(props.chain.getName());

            setAsset(assetData);
            setLoading(false);
        };

        fetchAssetDetails();
    }, [props.chain]);

    if (loading || !asset || !asset.account) {
        return <Loader />;
    }

    const handleOpenQRScan = () => {
        (refMessage?.current as any)?.open();
    };

    const handlePaste = async () => {
        const content = await Clipboard.getString();

        if (props.chain.isValidCryptoAddress(content)) {
            onChangeAddress(content);
        } else {
            errorStore.setError({
                error: new Error('The address you entered is invalid!'),
                title: 'Invalid address',
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

    const handleMaxAmount = () => {
        if (asset.balance) {
            onChangeAmount(asset.balance);
            onChangeUSDAmount(asset.usdBalance ? asset.usdBalance.toString() : '0');
        }
    };

    const handleSendTransaction = async () => {
        setSubmitting(true);

        try {
            if (Number(asset.balance) < Number(amount)) {
                errorStore.setError({
                    error: new Error('You do not have enough balance!'),
                    expected: true,
                });
                return;
            }

            const key = props.privateKey;
            const chain = props.chain;
            const chainType = chain.getChainType();

            let value;
            const transactionData = {
                to: depositeAddress,
                from: asset.account,
                value,
            };

            let transaction: ITransaction;

            if (chainType === ChainType.ETHEREUM) {
                transactionData.value = ethers.parseEther(amount ? amount.toString() : '0.00');
                const ethereumChain = props.chain as EthereumChain;
                const exportPrivateKey = await key.exportPrivateKey();
                const ethereumPrivateKey = new EthereumPrivateKey(exportPrivateKey, ethereumChain);

                transaction = await EthereumTransaction.fromTransaction(
                    ethereumPrivateKey,
                    transactionData,
                    ethereumChain
                );
                //TODO move it after condition when implement other chains
                props.navigation.navigate('SignTransaction', {
                    transaction,
                    privateKey: key,
                    session: null,
                    origin: '',
                    request: null,
                });
            } else {
                throw new Error('Chain not supported');
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
    const fetchEthPrice = async (amount) => {
        const ethPrice = props.chain.getNativeToken().getUsdPrice();
        const usdAmount = Number(amount) * Number(ethPrice);

        onChangeUSDAmount(usdAmount.toFixed(4));
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
                                onEndEditing={(e) => {
                                    const address = e.nativeEvent.text;

                                    if (!props.chain.isValidCryptoAddress(address)) {
                                        errorStore.setError({
                                            error: new Error('The address you entered is invalid!'),
                                            title: 'Invalid address',
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
                    {submitting && (
                        <View style={commonStyles.marginBottom}>
                            <Loader />
                        </View>
                    )}
                    <TButtonContained
                        disabled={!depositeAddress || !amount || submitting}
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
