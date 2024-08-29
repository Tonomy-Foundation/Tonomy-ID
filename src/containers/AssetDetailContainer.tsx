import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AssetDetailScreenNavigationProp } from '../screens/AssetDetail';
import { Images } from '../assets';
import theme, { commonStyles } from '../utils/theme';
import ArrowUpIcon from '../assets/icons/ArrowUpIcon';
import ArrowDownIcon from '../assets/icons/ArrowDownIcon';
import { TButtonSecondaryContained } from '../components/atoms/TButton';

export type AssetDetailProps = {
    navigation: AssetDetailScreenNavigationProp['navigation'];
    symbol: string;
    name: string;
    address?: string;
    icon?: ImageSourcePropType | undefined;
    image?: string;
};
const AssetDetailContainer = (props: AssetDetailProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.header}>
                        <View style={styles.networkHeading}>
                            {props.image ? (
                                <Image source={{ uri: props.image }} style={styles.faviconIcon} />
                            ) : (
                                <Image source={props.icon || Images.GetImage('logo1024')} style={styles.faviconIcon} />
                            )}
                            <View style={styles.assetsNetwork}>
                                <Text style={{ fontSize: 13 }}>{props.name}</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={styles.headerAssetsAmount}>0.035 ETH</Text>
                            <Text style={styles.headerAssetUSDAmount}>$112.20 USD</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 40, marginTop: 20 }}>
                            <TouchableOpacity
                                onPress={() =>
                                    props.navigation.navigate('Send', {
                                        screenTitle: `Send ${props.symbol}`,
                                        symbol: props.symbol,
                                        name: props.name,
                                        address: props.address,
                                        icon: props.icon,
                                        image: props.image,
                                    })
                                }
                                style={{ justifyContent: 'center', alignItems: 'center', gap: 8 }}
                            >
                                <View style={styles.headerButton}>
                                    <ArrowUpIcon />
                                </View>
                                <Text>Send</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() =>
                                    props.navigation.navigate('Receive', {
                                        screenTitle: `Receive ${props.symbol}`,
                                        symbol: props.symbol,
                                        name: props.name,
                                        address: props.address,
                                        icon: props.icon,
                                        image: props.image,
                                    })
                                }
                                style={{ justifyContent: 'center', alignItems: 'center', gap: 8 }}
                            >
                                <View style={styles.headerButton}>
                                    <ArrowDownIcon />
                                </View>
                                <Text>Receive</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ marginBottom: 20, justifyContent: 'center', gap: 10 }}>
                        <TouchableOpacity
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingVertical: 15,
                                paddingHorizontal: 20,
                            }}
                        >
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
});
export default AssetDetailContainer;
