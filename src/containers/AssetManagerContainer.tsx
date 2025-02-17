import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Linking, Image } from 'react-native';
import { LeosAssetsScreenNavigationProp } from '../screens/AssetManagerScreen';
import theme, { commonStyles } from '../utils/theme';
import { ArrowDown, ArrowUp, Clock, ArrowRight, NavArrowRight, Coins } from 'iconoir-react-native';
import { IChain } from '../utils/chain/types';
import { useEffect, useState } from 'react';
import { AccountTokenDetails, getAssetDetails } from '../utils/tokenRegistry';
import TSpinner from '../components/atoms/TSpinner';
import { formatCurrencyValue } from '../utils/numbers';
import { AntelopeAccount, AntelopeChain } from '../utils/chain/antelope';
import useErrorStore from '../store/errorStore';

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

const vestedBalanceView = (balance: Balance, navigation, chain: IChain) => {
    return (
        <View>
            <TouchableOpacity
                style={styles.vestedView}
                onPress={() => {
                    navigation.navigate('VestedAssets', {
                        chain: chain,
                    });
                }}
            >
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

const stakedBalanceView = (totalStaked: number, navigation, chain: IChain) => {
    return (
        <View>
            <TouchableOpacity
                style={styles.vestedView}
                onPress={() => {
                    navigation.navigate('StakeLeosDetail', {
                        chain: chain,
                    });
                }}
            >
                <Text style={{ color: theme.colors.grey9, fontSize: 12 }}>Staked</Text>
                <View style={styles.allocationView}>
                    <Text style={{ fontWeight: '700', fontSize: 12 }}>
                        {totalStaked} {chain.getNativeToken().getSymbol()}
                    </Text>
                    <View style={styles.flexColEnd}>
                        <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const investorTootlView = (navigation, chain, redirectStakeToEarn) => {
    return (
        <View>
            <Text style={styles.subTitle}>Investor tools</Text>
            <TouchableOpacity
                onPressIn={() => {
                    navigation.navigate('VestedAssets', {
                        chain: chain,
                    });
                }}
            >
                <View style={[styles.moreView, { flexDirection: 'row', alignItems: 'center' }]}>
                    <Image source={require('../assets/images/VestedAssetIcon.png')} style={styles.vestedIcon} />

                    <Text style={{ fontWeight: '600', marginLeft: 5 }}>Vested assets</Text>
                    <View style={[styles.flexColEnd, { marginLeft: 'auto' }]}>
                        <ArrowRight height={18} width={18} color={theme.colors.grey2} strokeWidth={2} />
                    </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPressIn={redirectStakeToEarn}>
                <View style={[styles.moreView, { flexDirection: 'row', alignItems: 'center' }]}>
                    <Coins height={18} width={18} color={theme.colors.black} strokeWidth={2} />
                    <Text style={{ fontWeight: '600', marginLeft: 5 }}>Stake to earn</Text>
                    <View style={[styles.flexColEnd, { marginLeft: 'auto' }]}>
                        <ArrowRight height={18} width={18} color={theme.colors.grey2} strokeWidth={2} />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
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
    const [showStaking, setShowStaking] = useState(false);
    const [totalStaked, setTotalStaked] = useState(0);

    const [loading, setLoading] = useState(true);
    const token = chain.getNativeToken();
    const symbol = chain.getNativeToken().getSymbol();

    const isVestable = chain.getNativeToken().isVestable();

    useEffect(() => {
        const fetchAssetDetails = async () => {
            try {
                const assetData = await getAssetDetails(chain);

                setAsset(assetData);

                if (isVestable) {
                    const account = AntelopeAccount.fromAccount(chain as AntelopeChain, assetData.account);
                    const vestedBalance = await token.getVestedTotalBalance(account);
                    const availableBalance = await token.getAvailableBalance(account);
                    const totalBalance = availableBalance.add(vestedBalance);

                    try {
                        const accountData = await token.getAccountStateData(account);

                        if (accountData) {
                            setTotalStaked(accountData.totalStaked);
                            setShowStaking(true);
                        }
                    } catch (e) {
                        if (e.message === 'Account not found in staking contract') {
                            setShowStaking(false);
                        }
                    }

                    if (Number(vestedBalance.getAmount()) > 0) {
                        setShowVesting(true);
                    }

                    setBalance({
                        totalBalance: totalBalance.toString(),
                        totalBalanceUsd: await totalBalance.getUsdValue(),
                        availableBalance: availableBalance.toString(),
                        availableBalanceUsd: await availableBalance.getUsdValue(),
                        vestedBalance: vestedBalance.toString(),
                        vestedBalanceUsd: await vestedBalance.getUsdValue(),
                    });
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
    }, [chain, token, symbol, errorStore, isVestable]);

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

    const redirectStakeToEarn = () => {
        if (totalStaked > 0) {
            navigation.navigate('StakeLeosDetail', {
                chain: chain,
            });
        } else {
            navigation.navigate('StakeLeos', {
                chain: chain,
            });
        }
    };

    return (
        <View style={styles.container}>
            {isVestable && <View>{renderImageBackground(balance)}</View>}
            {showVesting && vestedBalanceView(balance, navigation, asset.chain)}
            {showStaking && stakedBalanceView(totalStaked, navigation, asset.chain)}

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
            {investorTootlView(navigation, asset.chain, redirectStakeToEarn)}
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
