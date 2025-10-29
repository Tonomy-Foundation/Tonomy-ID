import { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ImageBackground,
    Linking,
    Image,
    ScrollView,
    Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ArrowDown, ArrowUp, Clock, ArrowRight, NavArrowRight, Coins, DataTransferBoth } from 'iconoir-react-native';
import { Asset, IChain } from '../utils/chain/types';
import { Props } from '../screens/AssetManagerScreen';
import theme, { commonStyles } from '../utils/theme';
import {
    AccountTokenDetails,
    getAccountFromChain,
    getAssetDetails,
    getTokenEntryByChain,
} from '../utils/tokenRegistry';
import TSpinner from '../components/atoms/TSpinner';
import { formatCurrencyValue, formatTokenValue } from '../utils/numbers';
import useErrorStore from '../store/errorStore';
import Decimal from 'decimal.js';
import { SdkErrors, isErrorCode } from '@tonomy/tonomy-id-sdk';
import useUserStore from '../store/userStore';
import settings from '../settings';
import { formatAssetToNumber } from '../utils/numbers';

export type AssetsProps = {
    navigation: Props['navigation'];
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
                <Text style={styles.imageNetworkText}>{settings.config.ecosystemName} Network</Text>
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
                <View style={styles.balanceContainer}>
                    <View>
                        <Text style={styles.balanceLabelText}>Vested</Text>
                        <Text style={styles.balanceAmountText}>{balance.vestedBalance}</Text>
                    </View>
                    <View style={styles.navArrowContainer}>
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
                    navigation.navigate('StakeAssetDetail', {
                        chain: chain,
                    });
                }}
            >
                <View style={styles.balanceContainer}>
                    <View>
                        <Text style={styles.balanceLabelText}>Staked</Text>
                        <Text style={styles.balanceAmountText}>
                            {formatTokenValue(new Decimal(totalStaked))} {chain.getNativeToken().getSymbol()}
                        </Text>
                    </View>
                    <View style={styles.navArrowContainer}>
                        <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const investorTootlView = (navigation, chain, redirectStakeToEarn, showVesting, showStakeToEarn) => {
    return (
        <View>
            <Text style={styles.subTitle}>Investor tools</Text>
            {showVesting && (
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
            )}
            {showStakeToEarn && (
                <TouchableOpacity onPressIn={redirectStakeToEarn}>
                    <View style={[styles.moreView, { flexDirection: 'row', alignItems: 'center' }]}>
                        <Coins height={18} width={18} color={theme.colors.black} strokeWidth={2} />
                        <Text style={{ fontWeight: '600', marginLeft: 5 }}>Stake to earn</Text>
                        <View style={[styles.flexColEnd, { marginLeft: 'auto' }]}>
                            <ArrowRight height={18} width={18} color={theme.colors.grey2} strokeWidth={2} />
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
};

const AssetManagerContainer = ({ navigation, chain }: AssetsProps) => {
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
    const isStakeable = chain.getNativeToken().isStakeable();
    const isSwapable = chain.getNativeToken().isSwapable();

    const handleSwapPress = async () => {
        try {
            // Replace with your actual swap website URL
            await Linking.openURL(settings.config.tonomyAppsOrigin);
        } catch (error) {
            console.error('Error opening web browser:', error);
        }
    };
    const { user } = useUserStore();

    useEffect(() => {
        const fetchAssetDetails = async () => {
            try {
                const assetData = await getAssetDetails(chain);
                const tokenEntry = await getTokenEntryByChain(chain);

                const account = await getAccountFromChain(tokenEntry, user);

                setAsset(assetData);

                if (isStakeable) {
                    try {
                        const accountData = await token.getAccountStateData(account);

                        if (accountData) {
                            const totalStaked = accountData.totalStaked + accountData.totalUnlocking;

                            setTotalStaked(totalStaked);
                            setShowStaking(accountData.allocations.length > 0 ? true : false);
                        }
                    } catch (e) {
                        if (isErrorCode(e, SdkErrors.AccountNotFound)) {
                            setShowStaking(false);
                        }
                    }
                }

                if (isVestable) {
                    const allocations = await token.getVestedTokens(account);
                    const lockedAsset = new Asset(token, new Decimal(allocations.locked));
                    const availableBalance = await token.getAvailableBalance(account);
                    const totalBalance = await token.getBalance(account);

                    if (Number(lockedAsset.getAmount()) > 0) {
                        setShowVesting(true);
                    } else {
                        setShowVesting(false);
                    }

                    setBalance({
                        totalBalance: totalBalance.toString(),
                        totalBalanceUsd: await totalBalance.getUsdValue(),
                        availableBalance: availableBalance.toString(),
                        availableBalanceUsd: await availableBalance.getUsdValue(),
                        vestedBalance: lockedAsset.toString(),
                        vestedBalanceUsd: await lockedAsset.getUsdValue(),
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
    }, [chain, token, symbol, errorStore, isVestable, isStakeable, user]);

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

    const showStakeToEarn =
        (balance.availableBalance && formatAssetToNumber(balance.availableBalance) > new Decimal(0)) || showStaking;

    const redirectStakeToEarn = () => {
        if (showStaking) {
            navigation.navigate('StakeAssetDetail', {
                chain: chain,
            });
        } else {
            navigation.navigate('StakeAsset', {
                chain: chain,
            });
        }
    };

    return (
        <View style={styles.container}>
            {isVestable && <View>{renderImageBackground(balance)}</View>}
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
                {showVesting && vestedBalanceView(balance, navigation, asset.chain)}
                {totalStaked > 0 && stakedBalanceView(totalStaked, navigation, asset.chain)}

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
                                    <ArrowUp height={24} width={24} color={theme.colors.black} strokeWidth={2} />
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
                                    <ArrowDown height={24} width={24} color={theme.colors.black} strokeWidth={2} />
                                </View>
                                <Text style={styles.textSize}>Receive</Text>
                            </TouchableOpacity>
                            {isSwapable && Platform.OS === 'android' && (
                                <TouchableOpacity onPress={handleSwapPress} style={styles.flexCenter}>
                                    <View style={styles.headerButton}>
                                        <DataTransferBoth
                                            height={24}
                                            width={24}
                                            color={theme.colors.black}
                                            strokeWidth={2}
                                        />
                                    </View>
                                    <Text style={styles.textSize}>Swap</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.flexCenter} onPress={redirectToCheckExplorer}>
                                <View style={styles.headerButton}>
                                    <Clock height={24} width={24} color={theme.colors.black} strokeWidth={2} />
                                </View>
                                <Text style={styles.textSize}>History</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {(showVesting || showStakeToEarn) &&
                    investorTootlView(navigation, asset.chain, redirectStakeToEarn, showVesting, showStakeToEarn)}
            </ScrollView>
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
        width: 46,
        height: 46,
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
    balanceContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navArrowContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    balanceLabelText: {
        color: theme.colors.grey9,
        fontWeight: '400',
        fontSize: 12,
    },
    balanceAmountText: {
        fontWeight: '500',
        fontSize: 14,
    },
});

export default AssetManagerContainer;
