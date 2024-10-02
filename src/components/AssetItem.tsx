import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../utils/theme';
import { formatCurrencyValue } from '../utils/numbers';
import { Images } from '../assets';
import { SelectAssetScreenNavigationProp } from '../screens/SelectAssetScreen';

export type AccountItemProps = {
    navigation: SelectAssetScreenNavigationProp['navigation'];
    accountBalance: { balance: string; usdBalance: number };
    networkName: string;
    currency: string;
    leos?: boolean;
    accountName?: string;
    type: string;
    icon?: ImageSourcePropType | undefined;
    account?: string;
    testnet?: boolean;
};

const AssetItem = (props: AccountItemProps) => {
    const handleOnPress = async () => {
        if (props.type === 'receive') {
            props.navigation.navigate('Receive', {
                screenTitle: `Receive ${props.currency}`,
                network: props.networkName,
            });
        } else if (props.type === 'send') {
            props.navigation.navigate('Send', {
                screenTitle: `Send ${props.currency}`,
                network: props.networkName,
            });
        }
    };

    return (
        <TouchableOpacity style={styles.assetsView} onPress={handleOnPress}>
            <Image
                source={props.icon || Images.GetImage('logo1024')}
                style={[styles.favicon, { resizeMode: 'contain' }]}
            />
            <View style={styles.assetContent}>
                <View style={styles.flexRowCenter}>
                    <View style={styles.flexRowCenter}>
                        <Text style={{ fontSize: 16 }}>{props.currency}</Text>
                        <View style={styles.assetsNetwork}>
                            <Text style={{ fontSize: 12 }}>{props.networkName}</Text>
                        </View>
                    </View>
                    {props?.testnet === true && !props.leos && (
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
                        <Text style={{ fontSize: 16 }}>{props.accountBalance.balance}</Text>
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
        gap: 6,
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
        gap: 3,
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
