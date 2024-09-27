import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AssetDetailScreenNavigationProp } from '../screens/AssetDetail';
import { Images } from '../assets';
import theme, { commonStyles } from '../utils/theme';
import { TButtonSecondaryContained } from '../components/atoms/TButton';
import { ArrowDown, ArrowUp } from 'iconoir-react-native';

export type AssetDetailProps = {
    navigation: AssetDetailScreenNavigationProp['navigation'];
    symbol: string;
    name: string;
    account?: string;
    icon?: ImageSourcePropType | undefined;
    accountBalance: { balance: string; usdBalance: number };
};
const AssetDetailContainer = (props: AssetDetailProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.header}>
                        <View style={styles.networkHeading}>
                            <Image source={props.icon || Images.GetImage('logo1024')} style={styles.faviconIcon} />
                            <View style={styles.assetsNetwork}>
                                <Text style={{ fontSize: 13 }}>{props.name}</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={styles.headerAssetsAmount}>{`${props.accountBalance.balance}`}</Text>
                            <Text style={styles.headerAssetUSDAmount}>${props.accountBalance.usdBalance} USD</Text>
                        </View>
                        {props.symbol === 'LEOS' && (
                            <View style={styles.warning}>
                                <Text>All LEOS is vested until the public sale</Text>
                            </View>
                        )}
                        <View style={styles.flexRow}>
                            {props.symbol !== 'LEOS' && (
                                <TouchableOpacity
                                    onPress={() =>
                                        props.navigation.navigate('Send', {
                                            screenTitle: `Send ${props.symbol}`,
                                            symbol: props.symbol,
                                            name: props.name,
                                            account: props.account,
                                            icon: props.icon,
                                            accountBalance: props.accountBalance,
                                        })
                                    }
                                    style={styles.flexCenter}
                                >
                                    <View style={styles.headerButton}>
                                        <ArrowUp height={24} width={25} color={theme.colors.black} />
                                    </View>
                                    <Text>Send</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() =>
                                    props.navigation.navigate('Receive', {
                                        screenTitle: `Receive ${props.symbol}`,
                                        symbol: props.symbol,
                                        name: props.name,
                                        account: props.account,
                                        icon: props.icon,
                                        accountBalance: props.accountBalance,
                                    })
                                }
                                style={styles.flexCenter}
                            >
                                <View style={styles.headerButton}>
                                    <ArrowDown height={24} width={25} color={theme.colors.black} />
                                </View>
                                <Text>Receive</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ marginBottom: 20, justifyContent: 'center', gap: 10 }}>
                        <TouchableOpacity style={styles.transactionHistoryButton}>
                            <Text style={styles.textButton}>View your transaction history</Text>
                        </TouchableOpacity>
                        <TButtonSecondaryContained style={commonStyles.marginBottom} size="large">
                            Check explorer
                        </TButtonSecondaryContained>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    content: {
        flex: 1,
        marginTop: 10,
    },
    warning: {
        backgroundColor: theme.colors.gold,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    networkHeading: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    networkTitleName: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    faviconIcon: {
        width: 48,
        height: 48,
    },
    assetsNetwork: {
        backgroundColor: theme.colors.grey7,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    headerAssetsAmount: {
        fontSize: 40,
        fontWeight: '400',
        fontFamily: 'Roboto',
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
    },
    headerAssetUSDAmount: {
        fontSize: 14,
        fontWeight: '400',
        fontFamily: 'Roboto',
        color: theme.colors.secondary2,
    },
    headerButton: {
        backgroundColor: theme.colors.grey7,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    textButton: {
        fontSize: 16,
        fontWeight: '400',
        fontFamily: 'Roboto',
    },
    transactionHistoryButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    flexRow: {
        flexDirection: 'row',
        gap: 40,
        marginTop: 20,
    },
});
export default AssetDetailContainer;
