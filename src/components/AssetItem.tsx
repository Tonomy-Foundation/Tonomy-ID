import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../utils/theme';
import { formatCurrencyValue } from '../utils/numbers';
import { useEffect, useState } from 'react';
import { Images } from '../assets';
import { IAccount } from '../utils/chain/types';
import { capitalizeFirstLetter, progressiveRetryOnNetworkError } from '../utils/helper';
import { SelectAssetScreenNavigationProp } from '../screens/SelectAsset';
import Debug from 'debug';
import { assetStorage } from '../utils/StorageManager/setup';
import useUserStore from '../store/userStore';
import { VestingContract } from '@tonomy/tonomy-id-sdk';
import { USD_CONVERSION } from '../utils/chain/etherum';
const debug = Debug('tonomy-id:component:AcountSummary');
const vestingContract = VestingContract.Instance;
export type AccountItemProps = {
    navigation: SelectAssetScreenNavigationProp['navigation'];
    address: IAccount | null;
    networkName: string;
    currency: string;
    leos?: boolean;
    accountName?: string;
    type: string;
    storageName?: string;
};
const AssetItem = (props: AccountItemProps) => {
    const currentAddress = props.address?.getName();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [accountBalance, setAccountBalance] = useState<{ balance: string; usdBalance: number }>({
        balance: '0',
        usdBalance: 0,
    });
    debug('accountBalance:', props.storageName, currentAddress, accountBalance);

    const userStore = useUserStore();
    const user = userStore.user;

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                progressiveRetryOnNetworkError(async () => {
                    if (props.address) {
                        const accountToken = await props.address.getNativeToken();

                        setLogoUrl(accountToken.getLogoUrl());
                    }
                });
            } catch (e) {
                console.error('Failed to fetch logo', e);
            }
        };

        const fetchBalance = async () => {
            if (props.currency !== 'LEOS' && props.storageName) {
                const balance = await assetStorage.findBalanceByName(props.storageName);
                setAccountBalance(balance);
            } else {
                const accountName = (await user.getAccountName()).toString();
                const accountPangeaBalance = await vestingContract.getBalance(accountName);
                setAccountBalance({
                    balance: accountPangeaBalance.toString(),
                    usdBalance: accountPangeaBalance * USD_CONVERSION,
                });
            }
        };

        fetchLogo();
        fetchBalance();
    }, [props.address, props.storageName, props.currency, user]);

    const getBalance = () => {
        return accountBalance.balance.replace(props.currency, '')?.trim();
    };

    const getAccountDetail = async (account) => {
        if (account && !props.leos) {
            const accountToken = await account.getNativeToken();
            const logoUrl = accountToken.getLogoUrl();
            return {
                symbol: accountToken.getSymbol(),
                name: capitalizeFirstLetter(account.getChain().getName()),
                account: account,
                ...(logoUrl && { image: logoUrl }),
            };
        } else {
            return {
                symbol: props.currency,
                name: props.networkName,
                account: props.accountName,
                icon: Images.GetImage('logo1024'),
            };
        }
    };

    const handleOnPress = async () => {
        const account = await getAccountDetail(props.address);
        if (props.type === 'receive') {
            props.navigation.navigate('Receive', {
                screenTitle: `Receive ${props.currency}`,
                ...account,
                accountBalance: accountBalance,
            });
        } else if (props.type === 'send') {
            props.navigation.navigate('Send', {
                screenTitle: `Send ${props.currency}`,
                ...account,
                accountBalance: accountBalance,
            });
        }
    };

    return (
        <TouchableOpacity style={styles.assetsView} onPress={handleOnPress}>
            {props.leos && <Image source={Images.GetImage('logo1024')} style={styles.favicon} />}
            {logoUrl && <Image source={{ uri: logoUrl }} style={[styles.favicon, { resizeMode: 'contain' }]} />}
            <View style={styles.assetContent}>
                <View style={styles.flexRowCenter}>
                    <View style={styles.flexRowCenter}>
                        <Text style={{ fontSize: 16 }}>{props.currency}</Text>
                        <View style={styles.assetsNetwork}>
                            <Text style={{ fontSize: 13 }}>{props.networkName}</Text>
                        </View>
                    </View>
                    {props.address?.getChain().getChainId() === '11155111' && !props.leos && (
                        <View style={styles.assetsTestnetNetwork}>
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: theme.colors.white,
                                }}
                            >
                                Testnet
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.flexColEnd}>
                    <View style={styles.rowCenter}>
                        <Text style={{ fontSize: 16 }}>{getBalance() || 0}</Text>
                    </View>
                    <Text style={styles.secondaryColor}>
                        ${formatCurrencyValue(Number(accountBalance.usdBalance), 3)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    assetsView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    favicon: {
        width: 20,
        height: 20,
        marginRight: 4,
    },
    assetsNetwork: {
        backgroundColor: theme.colors.grey7,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    secondaryColor: {
        fontSize: 13,
        color: theme.colors.secondary2,
    },
    assetsTestnetNetwork: {
        backgroundColor: theme.colors.blue,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    assetContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    flexRowCenter: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    flexColEnd: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default AssetItem;
