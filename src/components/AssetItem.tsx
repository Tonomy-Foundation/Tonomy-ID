import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../utils/theme';
import { formatCurrencyValue } from '../utils/numbers';
import { Images } from '../assets';
import { SelectAssetScreenNavigationProp } from '../screens/SelectAssetScreen';
import { IChain, IPrivateKey } from '../utils/chain/types';

export type IOperationData = {
    accountBalance: { balance: string; usdBalance: number };
    networkName: string;
    currency: string;
    leos?: boolean;
    accountName?: string;
    type: string;
    icon?: ImageSourcePropType | undefined;
    account?: string;
    testnet?: boolean;
    chain?: IChain;
    privateKey?: IPrivateKey;
};

export type AccountItemProps = {
    navigation: SelectAssetScreenNavigationProp['navigation'];
    operationData: IOperationData;
};

const AssetItem = (props: AccountItemProps) => {
    const operationData = props.operationData;
    const handleOnPress = async () => {
        if (operationData.type === 'receive') {
            props.navigation.navigate('Receive', {
                screenTitle: `Receive ${operationData.currency}`,
                network: operationData.networkName,
            });
        } else if (operationData.type === 'send') {
            props.navigation.navigate('Send', {
                screenTitle: `Send ${operationData.currency}`,
                network: operationData.networkName,
                chain: operationData.chain as IChain,
                privateKey: operationData.privateKey as IPrivateKey,
            });
        }
    };

    return (
        <TouchableOpacity style={styles.assetsView} onPress={handleOnPress}>
            <Image
                source={operationData.icon || Images.GetImage('logo1024')}
                style={[styles.favicon, { resizeMode: 'contain' }]}
            />
            <View style={styles.assetContent}>
                <View style={styles.flexRowCenter}>
                    <View style={styles.flexRowCenter}>
                        <Text style={{ fontSize: 16 }}>{operationData.currency}</Text>
                        <View style={styles.assetsNetwork}>
                            <Text style={{ fontSize: 12 }}>{operationData.networkName}</Text>
                        </View>
                    </View>
                    {operationData?.testnet === true && !operationData.leos && (
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
                        <Text style={{ fontSize: 16 }}>{operationData.accountBalance.balance}</Text>
                    </View>
                    <Text style={styles.secondaryColor}>
                        ${formatCurrencyValue(Number(operationData.accountBalance.usdBalance), 3)}
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
