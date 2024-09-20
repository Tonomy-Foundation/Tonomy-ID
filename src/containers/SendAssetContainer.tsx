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
import { SendAssetScreenNavigationProp } from '../screens/Send';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import ScanIcon from '../assets/icons/ScanIcon';
import QRScan from '../components/QRScan';
import { useEffect, useRef, useState } from 'react';
import useWalletStore from '../store/useWalletStore';
import { formatCurrencyValue } from '../utils/numbers';
import { USD_CONVERSION } from '../utils/chain/etherum';
import useUserStore from '../store/userStore';
import { VestingContract } from '@tonomy/tonomy-id-sdk';
import { IAccount, ITransaction } from '../utils/chain/types';
import { keyStorage } from '../utils/StorageManager/setup';
import {
    EthereumMainnetChain,
    EthereumPolygonChain,
    EthereumPrivateKey,
    EthereumSepoliaChain,
    EthereumTransaction,
} from '../utils/chain/etherum';

import { Images } from '../assets';
import { progressiveRetryOnNetworkError } from '../utils/network';

const vestingContract = VestingContract.Instance;
export type SendAssetProps = {
    navigation: SendAssetScreenNavigationProp['navigation'];
    symbol: string;
    name: string;
    account?: string;
    icon?: ImageSourcePropType | undefined;
    image?: string;
    accountBalance: { balance: string; usdBalance: number };
};
const SendAssetContainer = (props: SendAssetProps) => {
    const [depositeAddress, onChangeAddress] = useState<string>();
    const [amount, onChangeAmount] = useState<string>();
    const [usdAmount, onChangeUSDAmount] = useState<string>();
    const userStore = useUserStore();
    const user = userStore.user;
    const [pangeaBalance, setPangeaBalance] = useState(0);
    const refMessage = useRef(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                progressiveRetryOnNetworkError(async () => {
                    if (props.account) {
                        //const accountToken = await props.account.getNativeToken();
                        setLogoUrl(null);
                    }
                });
            } catch (e) {
                console.error('Failed to fetch logo', e);
            }
        };

        fetchLogo();
    }, [props.account]);

    const handleOpenQRScan = () => {
        (refMessage?.current as any)?.open();
    };
    const onClose = () => {
        (refMessage.current as any)?.close();
    };

    // const { ethereumBalance, sepoliaBalance, polygonBalance } = useWalletStore((state) => ({
    //     ethereumBalance: state.ethereumBalance,
    //     sepoliaBalance: state.sepoliaBalance,
    //     polygonBalance: state.polygonBalance,
    // }));

    useEffect(() => {
        const fetchAccountname = async () => {
            const accountName = (await user.getAccountName()).toString();
            const accountPangeaBalance = await vestingContract.getBalance(accountName);
            setPangeaBalance(accountPangeaBalance);
        };
        if (props.name === 'Pangea') {
            fetchAccountname();
        }
    }, [user, props.name]);

    // const handleMaxAmount = () => {
    //     if (props.name === 'Sepolia') {
    //         const [balance] = sepoliaBalance.balance.split(' ');
    //         onChangeAmount(balance);
    //         onChangeUSDAmount(sepoliaBalance.usdBalance.toString());
    //     } else if (props.name === 'Ethereum') {
    //         const [balance] = ethereumBalance.balance.split(' ');
    //         onChangeAmount(balance);
    //         onChangeUSDAmount(ethereumBalance.usdBalance.toString());
    //     } else if (props.name === 'Polygon') {
    //         const [balance] = polygonBalance.balance.split(' ');
    //         onChangeAmount(balance);
    //         onChangeUSDAmount(polygonBalance.usdBalance.toString());
    //     } else if (props.name === 'Pangea') {
    //         onChangeAmount(pangeaBalance.toString());
    //         onChangeUSDAmount(formatCurrencyValue(pangeaBalance * USD_CONVERSION).toString());
    //     }
    // };

    const onScan = (address) => {
        const currentAddress = `${address.substring(0, 7)}...${address.substring(address.length - 6)}`;
        onChangeAddress(address);
        onClose();
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
                            />
                            <TouchableOpacity style={styles.inputButton} onPress={handleOpenQRScan}>
                                <Text style={styles.inputButtonText}>Paste</Text>
                                <ScanIcon color={theme.colors.success} width={18} height={18} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.networkContainer}>
                            {logoUrl ? (
                                <Image source={{ uri: logoUrl }} style={[styles.favicon, { resizeMode: 'contain' }]} />
                            ) : (
                                <Image source={Images.GetImage('logo1024')} style={styles.favicon} />
                            )}
                            <Text style={styles.networkName}>{props.name} network</Text>
                        </View>
                        <View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={amount}
                                    style={styles.input}
                                    placeholder="Enter amount"
                                    placeholderTextColor={theme.colors.tabGray}
                                />
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    <TouchableOpacity style={styles.inputButton}>
                                        <Text style={styles.currencyButtonText}>{props.symbol}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.inputButton}>
                                        <Text style={styles.inputButtonText}>MAX</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.inputHelp}>${Number(usdAmount) || '0.00'}</Text>
                        </View>
                    </View>
                </ScrollView>
                <View style={commonStyles.marginBottom}>
                    <TButtonContained style={commonStyles.marginBottom} size="large">
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
        fontFamily: 'Roboto',
        fontWeight: '500',
    },
    inputButtonText: {
        color: theme.colors.success,
        fontSize: 15,
        fontFamily: 'Roboto',
        fontWeight: '500',
    },
    inputHelp: {
        marginTop: 5,
        fontSize: 15,
        fontFamily: 'Roboto',
        color: theme.colors.tabGray,
    },
    flexCol: {
        flexDirection: 'column',
        gap: 15,
    },
});
export default SendAssetContainer;
