import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../utils/theme';
import { formatCurrencyValue } from '../utils/numbers';
import { useEffect, useState } from 'react';
import { Images } from '../assets';
import { IAccount } from '../utils/chain/types';
import { capitalizeFirstLetter } from '../utils/helper';
import { SelectAssetScreenNavigationProp } from '../screens/SelectAsset';

export type AccountItemProps = {
    navigation: SelectAssetScreenNavigationProp['navigation'];
    accountBalance: { balance: string; usdBalance: number | string };
    address: IAccount | null;
    networkName: string;
    currency: string;
    leos?: boolean;
    accountName?: string;
    type: string;
};
const AssetItem = (props: AccountItemProps) => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogo = async () => {
            if (props.address && !props.leos) {
                const accountToken = await props.address.getNativeToken();
                setLogoUrl(accountToken.getLogoUrl());
            }
        };
        fetchLogo();
    }, [props.address, props.leos]);

    const getBalance = () => {
        return props.accountBalance.balance.replace(props.currency, '')?.trim();
    };

    const getAccountDetail = async (account) => {
        if (account && !props.leos) {
            const accountToken = await account.getNativeToken();
            const logoUrl = accountToken.getLogoUrl();
            return {
                symbol: accountToken.getSymbol(),
                name: capitalizeFirstLetter(account.getChain().getName()),
                address: account?.getName() || '',
                ...(logoUrl && { image: logoUrl }),
            };
        } else {
            return {
                symbol: props.currency,
                name: props.networkName,
                address: props.accountName,
                icon: Images.GetImage('logo1024'),
            };
        }
    };

    const handleOnPress = async () => {
        const account = await getAccountDetail(props.address);
        if (props.type === 'receive') {
            props.navigation.navigate('Receive', { screenTitle: `Receive ${props.currency}`, ...account });
        } else if (props.type === 'send') {
            props.navigation.navigate('Send', { screenTitle: `Send ${props.currency}`, ...account });
        }
    };

    return (
        <TouchableOpacity style={styles.assetsView} onPress={handleOnPress}>
            {props.leos && <Image source={Images.GetImage('logo1024')} style={styles.favicon} />}
            {logoUrl && <Image source={{ uri: logoUrl }} style={[styles.favicon, { resizeMode: 'contain' }]} />}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flex: 1,
                }}
            >
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <Text style={{ fontSize: 16 }}>{props.currency}</Text>
                        <View style={styles.assetsNetwork}>
                            <Text style={{ fontSize: 13 }}>{props.networkName}</Text>
                        </View>
                    </View>
                    {props.address?.getChain().getChainId() !== '1' && !props.leos && (
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
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16 }}>{getBalance() || 0}</Text>
                    </View>
                    <Text style={styles.secondaryColor}>
                        ${formatCurrencyValue(Number(props.accountBalance.usdBalance), 3)}
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
});

export default AssetItem;
