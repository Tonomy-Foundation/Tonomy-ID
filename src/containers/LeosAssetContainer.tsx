import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Linking } from 'react-native';
import { LeosAssetsScreenNavigationProp } from '../screens/LeosAssetScreen';
import theme, { commonStyles } from '../utils/theme';
import { ArrowDown, ArrowUp, Clock, ArrowRight } from 'iconoir-react-native';
import { IChain } from '../utils/chain/types';
import { useEffect, useState } from 'react';
import { AccountTokenDetails, getAssetDetails } from '../utils/tokenRegistry';
import TSpinner from '../components/atoms/TSpinner';

export type AssetDetailProps = {
    navigation: LeosAssetsScreenNavigationProp['navigation'];
    chain: IChain;
};

const LeosAssetContainer = ({ navigation, chain }: AssetDetailProps) => {
    const [asset, setAsset] = useState<AccountTokenDetails>({} as AccountTokenDetails);
    const [loading, setLoading] = useState(true);

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
        const explorerUrl = asset.chain.getExplorerUrl({ accountName: asset.account });

        Linking.openURL(explorerUrl);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.subTitle}>Total assets</Text>
            <ImageBackground
                source={require('../assets/images/vesting/bg1.png')}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 10 }}
                resizeMode="cover"
            >
                <Text style={styles.imageNetworkText}>Pangea Network</Text>
                <Text style={styles.imageText}>69,023.35 LEOS</Text>
                <Text style={styles.imageUsdText}>= $3273.1</Text>
            </ImageBackground>
            <Text style={styles.subTitle}>Available assets</Text>

            <View style={styles.availableAssetView}>
                <View style={styles.header}>
                    <Text style={styles.headerAssetsAmount}>{`69,023.35 LEOS`}</Text>
                    <Text style={styles.headerUSDAmount}>{`= $3273.1`}</Text>

                    <View style={styles.sendReceiveButtons}>
                        <TouchableOpacity
                            style={styles.flexCenter}
                            onPress={() =>
                                navigation.navigate('Send', {
                                    chain: asset.chain,
                                    privateKey: asset.privateKey,
                                })
                            }
                        >
                            <View style={styles.headerButton}>
                                <ArrowUp height={18} width={18} color={theme.colors.black} strokeWidth={2} />
                            </View>
                            <Text style={styles.textSize}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('Receive', {
                                    chain: asset.chain,
                                })
                            }
                            style={styles.flexCenter}
                        >
                            <View style={styles.headerButton}>
                                <ArrowDown height={18} width={18} color={theme.colors.black} strokeWidth={2} />
                            </View>
                            <Text style={styles.textSize}>Receive</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.flexCenter} onPress={redirectToCheckExplorer}>
                            <View style={styles.headerButton}>
                                <Clock height={18} width={18} color={theme.colors.black} strokeWidth={2} />
                            </View>
                            <Text style={styles.textSize}>History</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Text style={styles.subTitle}>More</Text>
            <TouchableOpacity
                onPressIn={() =>
                    navigation.navigate('VestedAssets', {
                        chain: asset.chain,
                    })
                }
            >
                <View style={styles.moreView}>
                    <Text style={{ fontWeight: '600' }}>Vested assets</Text>
                    <View style={styles.flexColEnd}>
                        <ArrowRight height={18} width={18} color={theme.colors.grey2} strokeWidth={2} />
                    </View>
                </View>
            </TouchableOpacity>

            <View style={styles.moreView}>
                <Text style={{ fontWeight: '600' }}>Staking</Text>
                <View style={styles.flexColEnd}>
                    <ArrowRight height={18} width={18} color={theme.colors.grey2} strokeWidth={2} />
                </View>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 15,
    },

    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 22,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 35,
        borderRadius: 10,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    headerAssetsAmount: {
        fontSize: 22,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    headerUSDAmount: {
        fontSize: 15,
        fontWeight: '400',
        color: theme.colors.grey9,
    },
    headerButton: {
        backgroundColor: theme.colors.backgroundGray,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    sendReceiveButtons: {
        flexDirection: 'row',
        gap: 30,
        marginTop: 10,
    },
    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    textSize: {
        fontSize: 12,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    availableAssetView: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        paddingVertical: 26,
        paddingHorizontal: 20,
    },
    subTitle: {
        marginTop: 20,
        marginBottom: 10,
        fontSize: 16,
        ...commonStyles.primaryFontFamily,
    },
    moreView: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        paddingHorizontal: 13,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    flexColEnd: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    imageBackground: {
        width: '100%',
        height: 170,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    imageText: {
        color: theme.colors.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    imageUsdText: {
        color: theme.colors.white,
        fontSize: 15,
        fontWeight: '500',
    },
    imageNetworkText: {
        color: theme.colors.white,
        fontSize: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 4,
        borderRadius: 5,
    },
});

export default LeosAssetContainer;
