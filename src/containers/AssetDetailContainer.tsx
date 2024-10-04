import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AssetDetailScreenNavigationProp } from '../screens/AssetDetailScreen';
import { Images } from '../assets';
import theme, { commonStyles } from '../utils/theme';
import { TButtonSecondaryContained } from '../components/atoms/TButton';
import { ArrowDown, ArrowUp } from 'iconoir-react-native';
import { getAssetDetails } from '../utils/assetDetails';
import { useEffect, useState } from 'react';
import { formatCurrencyValue } from '../utils/numbers';
import useUserStore from '../store/userStore';
import settings from '../settings';
import { ExplorerOptions } from '../utils/chain/types';
import Loader from '../components/Loader';

export type AssetDetailProps = {
    navigation: AssetDetailScreenNavigationProp['navigation'];
    network: string;
};

const AssetDetailContainer = (props: AssetDetailProps) => {
    const [asset, setAsset] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const userStore = useUserStore();
    const user = userStore.user;

    const [accountName, setAccountName] = useState<string>('');

    useEffect(() => {
        const fetchAccountName = async () => {
            const accountName = (await user.getAccountName()).toString();

            setAccountName(accountName);
        };

        if (user) {
            fetchAccountName();
        }
    }, [user]);

    useEffect(() => {
        const fetchAssetDetails = async () => {
            const assetData = await getAssetDetails(props.network);

            setAsset(assetData);
            setLoading(false);
        };

        fetchAssetDetails();
    }, [props.network]);

    if (loading) {
        return <Loader />;
    }

    const redirectToCheckExplorer = () => {
        let explorerUrl: string;

        if (asset.symbol === 'LEOS') {
            explorerUrl = `${settings.config.blockExplorerUrl}/account/${accountName}`;
        } else {
            const explorerOptions: ExplorerOptions = {
                accountName: asset.account,
            };

            explorerUrl = asset.chain.getExplorerUrl(explorerOptions);
        }

        Linking.openURL(explorerUrl);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.header}>
                        <View style={styles.networkHeading}>
                            <Image source={asset.icon || Images.GetImage('logo1024')} style={styles.faviconIcon} />
                            <View style={styles.assetsNetwork}>
                                <Text style={styles.assetsNetworkText}>{asset.network}</Text>
                            </View>
                            <Text style={styles.headerAssetsAmount}>{`${asset.balance} ${asset.symbol}`}</Text>
                            <Text style={styles.headerAssetUSDAmount}>
                                ${formatCurrencyValue(asset.usdBalance, 3)} USD
                            </Text>
                        </View>

                        {asset.symbol === 'LEOS' && (
                            <View style={styles.warning}>
                                <Text>All LEOS is vested until the public sale</Text>
                            </View>
                        )}
                        <View style={styles.flexRow}>
                            {asset.symbol !== 'LEOS' && (
                                <TouchableOpacity
                                    onPress={() =>
                                        props.navigation.navigate('Send', {
                                            screenTitle: `Send ${asset.symbol}`,
                                            network: asset.network,
                                            chain: asset.chain,
                                            privateKey: asset.privateKey,
                                        })
                                    }
                                    style={styles.flexCenter}
                                >
                                    <View style={styles.headerButton}>
                                        <ArrowUp height={21} width={21} color={theme.colors.black} strokeWidth={2} />
                                    </View>
                                    <Text style={styles.textSize}>Send</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() =>
                                    props.navigation.navigate('Receive', {
                                        screenTitle: `Receive ${asset.symbol}`,
                                        network: asset.network,
                                    })
                                }
                                style={styles.flexCenter}
                            >
                                <View style={styles.headerButton}>
                                    <ArrowDown height={21} width={21} color={theme.colors.black} strokeWidth={2} />
                                </View>
                                <Text style={styles.textSize}>Receive</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.transactionHistoryView}>
                        <TouchableOpacity style={styles.transactionHistoryButton}>
                            <Text style={styles.textButton}>View your transaction history</Text>
                        </TouchableOpacity>
                        <TButtonSecondaryContained
                            onPress={redirectToCheckExplorer}
                            style={commonStyles.marginBottom}
                            size="large"
                        >
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
    },
    networkTitleName: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    faviconIcon: {
        width: 42,
        height: 42,
        marginBottom: 10,
    },
    assetsNetwork: {
        backgroundColor: theme.colors.grey7,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    assetsNetworkText: {
        fontSize: 13,
        fontWeight: '500',
    },
    headerAssetsAmount: {
        fontSize: 23,
        fontWeight: '700',
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
    },
    headerAssetUSDAmount: {
        fontSize: 15,
        fontWeight: '400',
        color: theme.colors.secondary2,
        ...commonStyles.secondaryFontFamily,
    },
    headerButton: {
        backgroundColor: theme.colors.backgroundGray,
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    textButton: {
        fontSize: 16,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    transactionHistoryButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    transactionHistoryView: {
        marginBottom: 20,
        justifyContent: 'center',
        gap: 10,
    },
    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 7,
    },
    flexRow: {
        flexDirection: 'row',
        gap: 35,
        marginTop: 20,
    },
    textSize: {
        fontSize: 14,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
});

export default AssetDetailContainer;
