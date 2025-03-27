import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Props } from '../screens/StakeAssetDetailScreen';
import { IChain } from '../utils/chain/types';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import { NavArrowRight } from 'iconoir-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import StakingAllocationDetails from '../components/StakingAllocationDetails';
import HowStakingWorks from '../components/HowStakingWorks';
import { getAccountFromChain, getTokenEntryByChain } from '../utils/tokenRegistry';
import useUserStore from '../store/userStore';
import { assetToAmount, StakingAccountState, StakingAllocation, StakingContract } from '@tonomy/tonomy-id-sdk';
import { formatCurrencyValue, formatTokenValue } from '../utils/numbers';
import Decimal from 'decimal.js';
import TSpinner from '../components/atoms/TSpinner';
import { useFocusEffect } from '@react-navigation/native';
import useErrorStore from '../store/errorStore';
import { getStakeReleaseTime, getUnstakeTime } from '../utils/time';

export type StakingLeosProps = {
    navigation: Props['navigation'];
    chain: IChain;
    loading?: boolean;
};

export function getUnlockStatus(allocation) {
    const unstakeableTime = getUnstakeTime(allocation.unstakeableTime);
    const releaseTime = getStakeReleaseTime(allocation.releaseTime);

    if (allocation.unstakeRequested) {
        return releaseTime > 0 ? `Released in ${releaseTime} days` : 'Released';
    } else {
        return unstakeableTime > 0 ? `Unlockable in ${unstakeableTime} days` : 'Unlockable';
    }
}

const StakeAssetDetailContainer = ({ navigation, chain, loading: propsLoading = false }: StakingLeosProps) => {
    const errorStore = useErrorStore();
    const [loading, setLoading] = useState(true);
    const [accountData, setAccountData] = useState<StakingAccountState>({} as StakingAccountState);
    const [selectedAllocation, setSelectedAllocation] = useState<StakingAllocation>({} as StakingAllocation);
    const refMessage = useRef<{ open: () => void; close: () => void }>(null);
    const refStakingInfo = useRef<{ open: () => void; close: () => void }>(null);
    const { user } = useUserStore();
    const token = chain.getNativeToken();
    const [usdPrice, setUsdPrice] = useState(0);

    useEffect(() => {
        const fetchStakedAllocation = async () => {
            try {
                const tokenEntry = await getTokenEntryByChain(chain);

                const account = await getAccountFromChain(tokenEntry, user);

                const accountData = await token.getAccountStateData(account);
                const usdPriceValue = await chain.getNativeToken().getUsdPrice();

                setUsdPrice(usdPriceValue);
                setAccountData(accountData);
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            } finally {
                setLoading(false);
            }
        };

        fetchStakedAllocation();
        const interval = setInterval(fetchStakedAllocation, 10000);

        return () => clearInterval(interval);
    }, [chain, user, errorStore, token]);

    const onClose = () => {
        refMessage.current?.close();
    };

    useFocusEffect(
        useCallback(() => {
            if (propsLoading) {
                setLoading(true);
            }
        }, [propsLoading])
    );

    if (loading) {
        return (
            <View style={styles.textContainer}>
                <TSpinner />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {assetToAmount(accountData.totalYield) > 100 && (
                <View style={styles.yieldRow}>
                    <View style={styles.flexStartCol}>
                        <Text style={styles.cryptoMsg}>{'Your crypto is working hard!'}</Text>
                        <Text style={styles.cryptoEarned}>
                            {formatTokenValue(new Decimal(assetToAmount(accountData.totalYield)))} earned
                        </Text>
                    </View>
                </View>
            )}

            <Text style={styles.subTitle}>Total staked</Text>

            <View style={styles.stakeView}>
                <View style={styles.row}>
                    <View style={styles.flexStartCol}>
                        <Text style={styles.lockedCoinsAmount}>
                            {formatTokenValue(new Decimal(accountData?.totalStaked))} {token.getSymbol()}
                        </Text>
                        <Text style={styles.lockedUSDAmount}>{`= $${formatCurrencyValue(
                            usdPrice * accountData?.totalStaked
                        )}`}</Text>
                    </View>
                    <View style={styles.flexEndCol}>
                        <Text style={styles.apyPercentage}>{accountData.settings.apy * 100}% APY</Text>
                        <Text style={styles.leosMonthly}>
                            {formatCurrencyValue(accountData.estimatedMonthlyYield)} LEOS / month
                        </Text>
                    </View>
                </View>
                <View style={styles.stakeMoreBtn}>
                    <TButtonContained
                        style={styles.fullWidthButton}
                        onPress={() =>
                            navigation.navigate('StakeLeos', {
                                chain: chain,
                            })
                        }
                    >
                        Stake more
                    </TButtonContained>
                </View>
            </View>

            {selectedAllocation && (
                <StakingAllocationDetails
                    chain={chain}
                    onClose={onClose}
                    refMessage={refMessage}
                    navigation={navigation}
                    allocation={selectedAllocation}
                    usdPrice={usdPrice}
                    accountData={accountData}
                />
            )}
            <ScrollView style={styles.scrollView}>
                {accountData?.allocations?.map((allocation, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.allocationView}
                        onPress={() => {
                            if (!allocation.unstakeRequested) {
                                setSelectedAllocation(allocation);
                                refMessage.current?.open();
                            }
                        }}
                    >
                        <Text style={{ fontWeight: '500' }}>
                            {formatTokenValue(new Decimal(assetToAmount(allocation.staked)))} {token.getSymbol()}
                        </Text>
                        <View style={styles.flexColEnd}>
                            <Text style={styles.allocMulti}>{getUnlockStatus(allocation)}</Text>
                            {!allocation.unstakeRequested && (
                                <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.unlockAssetView}>
                <Text style={styles.unlockhead}>Why are my coins locked?</Text>

                <Text style={styles.lockedParagraph}>
                    These coins are locked during the staking period to support the network and earn rewards. Coins will
                    be fully unlockable in {StakingContract.getLockedDays()} days after they are staked
                </Text>
                <TouchableOpacity onPress={() => refStakingInfo.current?.open()}>
                    <Text style={styles.howStaking}>How Staking Works</Text>
                </TouchableOpacity>
            </View>
            <HowStakingWorks refMessage={refStakingInfo} />
        </View>
    );
};

const styles = StyleSheet.create({
    scrollView: { minHeight: 170, maxHeight: 440, paddingTop: 5, marginBottom: 10 },

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
    yieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: theme.colors.backgroundGray,
        paddingHorizontal: 15,
        paddingVertical: 20,
        borderRadius: 8,
        // Android shadow
        elevation: 4,

        // iOS shadow
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    flexStartCol: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    stakeView: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        paddingVertical: 18,
        paddingHorizontal: 15,
        marginBottom: 7,
    },
    flexEndCol: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    stakeMoreBtn: {
        flexDirection: 'row',
        gap: 30,
        marginTop: 10,
    },
    unlockAssetView: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.grey7,
        borderRadius: 8,
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
    },
    subTitle: {
        marginTop: 22,
        marginBottom: 8,
        fontSize: 16,
        ...commonStyles.primaryFontFamily,
    },
    flexColEnd: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    fullWidthButton: {
        marginTop: 2,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockedCoinsAmount: {
        fontSize: 18,
        fontWeight: '700',
        ...commonStyles.secondaryFontFamily,
    },
    cryptoMsg: {
        fontSize: 16,
        fontWeight: '400',
        color: theme.colors.black,
    },
    cryptoEarned: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
    },
    apyPercentage: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.success,
        ...commonStyles.secondaryFontFamily,
    },
    leosMonthly: {
        fontSize: 13,
        color: theme.colors.grey9,
    },
    lockedUSDAmount: {
        fontSize: 15,
        fontWeight: '400',
        color: theme.colors.grey9,
    },
    allocationView: {
        backgroundColor: theme.colors.grey7,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    allocMulti: { color: theme.colors.grey9, fontWeight: '500' },

    unlockhead: {
        fontSize: 16,
        fontWeight: '700',
        alignItems: 'flex-start',
    },
    lockedParagraph: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.black,
        marginTop: 6,
    },
    howStaking: {
        fontSize: 13,
        fontWeight: '400',
        color: theme.colors.success,
        marginTop: 6,
    },
});

export default StakeAssetDetailContainer;
