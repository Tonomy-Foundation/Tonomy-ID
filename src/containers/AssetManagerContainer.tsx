import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Linking, Image } from 'react-native';
import { LeosAssetsScreenNavigationProp } from '../screens/AssetManagerScreen';
import theme, { commonStyles } from '../utils/theme';
import { ArrowDown, ArrowUp, Clock, ArrowRight, NavArrowRight, Coins } from 'iconoir-react-native';
import { IAsset, IChain } from '../utils/chain/types';
import { useEffect, useState } from 'react';
import { AccountTokenDetails, getAssetDetails } from '../utils/tokenRegistry';
import TSpinner from '../components/atoms/TSpinner';
import { formatCurrencyValue } from '../utils/numbers';
import { AntelopeAccount, PangeaMainnetChain, PangeaVestedToken } from '../utils/chain/antelope';
import useErrorStore from '../store/errorStore';
import Decimal from 'decimal.js';

export type Props = {
    navigation: LeosAssetsScreenNavigationProp['navigation'];
    chain: IChain;
};

interface Balance {
    totalBalance?: string;
    totalBalanceUsd?: number;
    availableBalance: string;
    availableBalanceUsd: number;
    vestedBalance?: string;
    vestedBalanceUsd?: number;
}

const renderImageBackground = (balance: Balance) => {
    return (
        <View>
            <Text style={styles.subTitle}>Total assets</Text>
            <ImageBackground
                source={require('../assets/images/vesting/bg1.png')}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 10 }}
                resizeMode="cover"
            >
                <Text style={styles.imageNetworkText}>Pangea Network</Text>
                <Text style={styles.imageText}>{balance.totalBalance}</Text>
                <Text style={styles.imageUsdText}>= ${formatCurrencyValue(balance.totalBalanceUsd ?? 0)}</Text>
            </ImageBackground>
        </View>
    );
};

const vestedBalanceView = (balance: Balance, asset: AccountTokenDetails, redirectVestedAsset) => {
    return (
        <View>
            <TouchableOpacity style={styles.vestedView} onPress={redirectVestedAsset}>
                <Text style={{ color: theme.colors.grey9, fontSize: 12 }}>Vested</Text>
                <View style={styles.allocationView}>
                    <Text style={{ fontWeight: '700', fontSize: 12 }}>{balance.vestedBalance}</Text>
                    <View style={styles.flexColEnd}>
                        <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const investorTootlView = (redirectVestedAsset) => {
    return (
        <View>
            <Text style={styles.subTitle}>Investor tools</Text>
            <TouchableOpacity onPressIn={redirectVestedAsset}>
                <View style={[styles.moreView, { flexDirection: 'row', alignItems: 'center' }]}>
                    <Image source={require('../assets/images/VestedAssetIcon.png')} style={styles.vestedIcon} />

                    <Text style={{ fontWeight: '600', marginLeft: 5 }}>Vested assets</Text>
                    <View style={[styles.flexColEnd, { marginLeft: 'auto' }]}>
                        <ArrowRight height={18} width={18} color={theme.colors.grey2} strokeWidth={2} />
                    </View>
                </View>
            </TouchableOpacity>
            {/* Uncomment when implementing staking */}
            {/* <View style={[styles.moreView, { flexDirection: 'row', alignItems: 'center' }]}>
                <Coins height={18} width={18} color={theme.colors.black} strokeWidth={2} />
                <Text style={{ fontWeight: '600', marginLeft: 5 }}>Stake to earn</Text>
                <View style={[styles.flexColEnd, { marginLeft: 'auto' }]}>
                    <ArrowRight height={18} width={18} color={theme.colors.grey2} strokeWidth={2} />
                </View>
            </View> */}
        </View>
    );
};

const formatBalance = (balance: IAsset) => {
    return balance.toString().split(' ')[0];
};

const getTotalBalance = (availableBalance: IAsset, vestedBalance: IAsset) => {
    const availableBalanceValue = formatBalance(availableBalance);
    const vestedBalanceValue = formatBalance(vestedBalance);

    return new Decimal(availableBalanceValue).add(vestedBalanceValue);
};

const AssetManagerContainer = ({ navigation, chain }: Props) => {
    const [asset, setAsset] = useState<AccountTokenDetails>({} as AccountTokenDetails);
    const errorStore = useErrorStore();

    const [balance, setBalance] = useState<Balance>({
        totalBalance: '',
        totalBalanceUsd: 0,
        availableBalance: '',
        availableBalanceUsd: 0,
        vestedBalance: '',
        vestedBalanceUsd: 0,
    });
    const [showVesting, setShowVesting] = useState(false);
    const [loading, setLoading] = useState(true);
    const token = chain.getNativeToken() as PangeaVestedToken;
    const symbol = chain.getNativeToken().getSymbol();

    const isVestingAvailable = chain.getNativeToken().isVesting();

    useEffect(() => {
        const fetchAssetDetails = async () => {
            try {
                const assetData = await getAssetDetails(chain);

                setAsset(assetData);

                if (isVestingAvailable) {
                    const account = AntelopeAccount.fromAccount(PangeaMainnetChain, assetData.account);
                    const vestedBalance = await token.getVestedTotalBalance(account);
                    const availableBalance = await token.getAvailableBalance(account);
                    const totalBalance = getTotalBalance(availableBalance, vestedBalance);
                    const usdPriceValue = await chain.getNativeToken().getUsdPrice();

                    setBalance({
                        totalBalance: totalBalance.toString() + ' ' + symbol,
                        totalBalanceUsd: totalBalance.toNumber() * usdPriceValue,
                        availableBalance: availableBalance.toString(),
                        availableBalanceUsd: await availableBalance.getUsdValue(),
                        vestedBalance: vestedBalance.toString(),
                        vestedBalanceUsd: await vestedBalance.getUsdValue(),
                    });
                    setShowVesting(true);
                } else {
                    setBalance({
                        availableBalance: assetData.token.balance + ' ' + symbol,
                        availableBalanceUsd: assetData.token.usdBalance,
                    });
                    setShowVesting(false);
                }
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            } finally {
                setLoading(false);
            }
        };

        fetchAssetDetails();

        const interval = setInterval(fetchAssetDetails, 10000);

        return () => clearInterval(interval);
    }, [chain, token, symbol, errorStore, isVestingAvailable]);

    const redirectVestedAsset = () => {
        navigation.navigate('VestedAssets', {
            chain: asset.chain,
        });
    };

    if (loading) {
        return (
            <View style={styles.textContainer}>
                <TSpinner />
            </View>
        );
    }

    const redirectToCheckExplorer = () => {
        const explorerUrl = asset.chain.getExplorerUrl({ accountName: asset.account });

        Linking.openURL(explorerUrl);
    };

    return (
        <View style={styles.container}>
            {showVesting && (
                <View>
                    {renderImageBackground(balance)}

                    {vestedBalanceView(balance, asset, redirectVestedAsset)}
                </View>
            )}

            <Text style={styles.subTitle}>Available assets</Text>

            <View style={styles.availableAssetView}>
                <View style={styles.header}>
                    <Text style={styles.headerAssetsAmount}>{balance.availableBalance}</Text>
                    <Text style={styles.headerUSDAmount}>
                        = ${formatCurrencyValue(balance.availableBalanceUsd ?? 0)}
                    </Text>

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
            {showVesting && investorTootlView(redirectVestedAsset)}
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
    flexColStart: {
        flexDirection: 'column',
        alignItems: 'flex-start',
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
    allocationView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    vestedView: {
        backgroundColor: theme.colors.grey7,
        borderRadius: 12,
        marginTop: 15,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    vestedIcon: {
        width: 20,
        height: 20,
    },
});

export default AssetManagerContainer;
