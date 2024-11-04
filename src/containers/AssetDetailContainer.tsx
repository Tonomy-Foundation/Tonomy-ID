import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AssetDetailScreenNavigationProp } from '../screens/AssetDetailScreen';
import { Images } from '../assets';
import theme, { commonStyles } from '../utils/theme';
import { TButtonSecondaryContained } from '../components/atoms/TButton';
import { ArrowDown, ArrowUp } from 'iconoir-react-native';
import { AccountTokenDetails, getAssetDetails } from '../utils/tokenRegistry';
import { useEffect, useState } from 'react';
import { formatCurrencyValue } from '../utils/numbers';
import TSpinner from '../components/atoms/TSpinner';
import { IChain } from '../utils/chain/types';
import { createChainWalletStore } from '../store/useWalletStore';

export type AssetDetailProps = {
    navigation: AssetDetailScreenNavigationProp['navigation'];
    chain: IChain;
};

const AssetDetailContainer = ({ navigation, chain }: AssetDetailProps) => {
    const useChainWalletStore = createChainWalletStore(chain);
    const [asset, setAsset] = useState<AccountTokenDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const networkLogo = asset?.token.icon ? { uri: asset.token.icon } : Images.GetImage('logo1024');
    const { account } = useChainWalletStore();

    useEffect(() => {
        const fetchAssetDetails = async () => {
            const assetData = await getAssetDetails(chain);

            setAsset(assetData);
            setLoading(false);
        };

        fetchAssetDetails();

        const interval = setInterval(fetchAssetDetails, 10000);

        return () => clearInterval(interval);
    }, [chain]);

    if (loading) {
        return <TSpinner />;
    }

    const redirectToCheckExplorer = () => {
        if (!asset) throw new Error('Asset not found');

        const explorerUrl = asset.chain.getExplorerUrl({ accountName: asset.account });

        Linking.openURL(explorerUrl);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {asset && (
                        <View style={styles.header}>
                            <View style={styles.networkHeading}>
                                <Image source={networkLogo} style={styles.faviconIcon} />
                                <View style={styles.assetsNetwork}>
                                    <Text style={styles.assetsNetworkText}>{asset.chain.getName()}</Text>
                                </View>
                                <Text
                                    style={styles.headerAssetsAmount}
                                >{`${asset.token.balance} ${asset.token.symbol}`}</Text>
                                <Text style={styles.headerAssetUSDAmount}>
                                    ${formatCurrencyValue(asset.token.usdBalance, 2)} USD
                                </Text>
                            </View>

                            {!asset.token.isTransferable && (
                                <View style={styles.warning}>
                                    <Text>All {asset.token.symbol} is vested until the public sale</Text>
                                </View>
                            )}
                            <View style={styles.flexRow}>
                                {asset.token.isTransferable && (
                                    <TouchableOpacity
                                        onPress={() =>
                                            navigation.navigate('Send', {
                                                screenTitle: `Send ${asset.token.symbol}`,
                                                chain: asset.chain,
                                                privateKey: asset.privateKey,
                                            })
                                        }
                                        style={styles.flexCenter}
                                    >
                                        <View style={styles.headerButton}>
                                            <ArrowUp
                                                height={21}
                                                width={21}
                                                color={theme.colors.black}
                                                strokeWidth={2}
                                            />
                                        </View>
                                        <Text style={styles.textSize}>Send</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate('Receive', {
                                            screenTitle: `Receive ${asset.token.symbol}`,
                                            chain: asset.chain,
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
                    )}
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
        borderRadius: 4,
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
        fontSize: 10,
        fontWeight: '500',
    },
    headerAssetsAmount: {
        fontSize: 26,
        fontWeight: '700',
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
    },
    headerAssetUSDAmount: {
        fontSize: 14,
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
