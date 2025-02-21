import { StyleSheet, Image, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Props } from '../screens/WithdrawVestedScreen';
import theme from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import { TP } from '../components/atoms/THeadings';
import { IChain } from '../utils/chain/types';
import { useEffect, useState } from 'react';
import { getAccountFromChain, getTokenEntryByChain } from '../utils/tokenRegistry';
import useUserStore from '../store/userStore';
import { formatCurrencyValue, formatTokenValue } from '../utils/numbers';
import Decimal from 'decimal.js';
import { assetToAmount, StakingAccountState, StakingContract } from '@tonomy/tonomy-id-sdk';
import useErrorStore from '../store/errorStore';

export type VestedAssetSuccessProps = {
    navigation: Props['navigation'];
    chain: IChain;
    amount: number;
};

const WithDrawVestedContainer = ({ navigation, chain, amount }: VestedAssetSuccessProps) => {
    const [loading, setLoading] = useState(false);
    const errorStore = useErrorStore();
    const [usdPrice, setUsdPrice] = useState(0);
    const [stakingValues, setStakingValues] = useState({
        apy: 0,
        monthlyEarnings: '0.00',
    });

    const token = chain.getNativeToken();
    const { user } = useUserStore();

    const withDrawVested = async () => {
        setLoading(true);
        const tokenEntry = await getTokenEntryByChain(chain);

        const account = await getAccountFromChain(tokenEntry, user);

        await token.withdrawVestedTokens(account);
        setLoading(false);

        navigation.navigate('SuccessVested', {
            chain,
        });
    };

    const getStakeUntilDate = () => {
        const date = new Date();

        date.setDate(date.getDate() + 14);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    useEffect(() => {
        const fetchStakedAllocation = async () => {
            try {
                const tokenEntry = await getTokenEntryByChain(chain);

                const account = await getAccountFromChain(tokenEntry, user);
                const usdPriceValue = await chain.getNativeToken().getUsdPrice();

                setUsdPrice(usdPriceValue);
                const accountData = await token.getAccountStateData(account);

                setStakingValues({
                    apy: accountData.settings.apy,
                    monthlyEarnings: accountData.totalYield,
                });
            } catch (e) {
                if (e.message === 'Account not found in staking contract') {
                    setStakingValues({
                        apy: StakingContract.MAX_APY,
                        monthlyEarnings:
                            formatTokenValue(
                                new Decimal(amount * (Math.pow(1 + StakingContract.MAX_APY, 1 / 12) - 1))
                            ) + ' LEOS',
                    });
                } else {
                    errorStore.setError({ error: e, expected: false });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStakedAllocation();
    }, []);

    return (
        <View style={styles.container}>
            <Image source={require('../assets/images/vesting/vested-success.png')} />
            <Text style={styles.vestedHead}>A special offer for you!</Text>
            <TP style={styles.vestedSubHead}>
                Stake {formatTokenValue(new Decimal(amount))} LEOS and earn a passive income
            </TP>
            <View style={styles.bottomView}>
                {loading ? (
                    <View style={styles.inlineContainer}>
                        <ActivityIndicator size="small" />
                        <Text style={styles.withDrawLoadingBtn}>Only withdraw</Text>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => withDrawVested()}>
                        <Text style={styles.withDrawBtn}>Only withdraw</Text>
                    </TouchableOpacity>
                )}
                <TButtonContained
                    style={styles.backBtn}
                    onPress={() =>
                        navigation.navigate('ConfirmStaking', {
                            chain: chain,
                            amount: amount,
                            withDraw: true,
                        })
                    }
                    disabled={loading}
                >
                    Stake and earn
                </TButtonContained>
            </View>

            <View style={styles.annualView}>
                <View style={styles.annualText}>
                    <Text style={styles.annualSubText}>Annual Percentage Yield (APY)</Text>
                    <Text style={styles.annualPercentage}>{stakingValues.apy * 100}%</Text>
                </View>
                <View style={styles.annualText}>
                    <Text style={styles.annualSubText}>Monthly earnings</Text>
                    <View>
                        <Text style={styles.annualPercentage}>{stakingValues?.monthlyEarnings}</Text>
                        <Text style={styles.annualSubText}>
                            ${formatCurrencyValue(assetToAmount(stakingValues?.monthlyEarnings) * usdPrice)}
                        </Text>
                    </View>
                </View>
                <View style={styles.annualText}>
                    <Text style={styles.annualSubText}>Stake until</Text>
                    <Text>
                        {getStakeUntilDate()} <Text style={styles.annualSubText}>(14 days)</Text>
                    </Text>
                </View>
            </View>
            <View style={styles.unlockAssetView}>
                <Text style={styles.unlockhead}>What is staking? </Text>
                <Text style={styles.lockedParagraph}>
                    Staking is locking up cryptocurrency to increase blockchain network security and earn rewards
                </Text>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 15,
        alignItems: 'center',
        marginTop: 5,
    },
    vestedHead: {
        marginBottom: 0,
        paddingHorizontal: 20,
        fontSize: 28,
        color: theme.colors.black,
        fontWeight: 'bold',
    },
    vestedSubHead: {
        paddingHorizontal: 45,
        textAlign: 'center',
        marginTop: 7,
        fontSize: 16,
        color: theme.colors.black,
    },
    bottomView: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    backBtn: {
        borderRadius: 6,
        width: '98%',
        paddingVertical: 15,
        marginBottom: 10,
    },
    annualView: {
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 6,
        borderColor: theme.colors.grey8,
        borderWidth: 1,
        marginTop: 20,
    },
    annualText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 8,
    },
    annualSubText: {
        fontSize: 14,
        color: theme.colors.grey9,
        textAlign: 'right',
    },
    annualPercentage: {
        fontWeight: '400',
        fontSize: 14,
        color: theme.colors.success,
    },
    unlockAssetView: {
        alignItems: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.grey7,
        borderRadius: 8,
        width: '100%',
        marginTop: 20,
    },
    unlockhead: {
        fontSize: 16,
        fontWeight: '700',
    },
    lockedParagraph: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.black,
        marginTop: 6,
    },
    withDrawBtn: {
        color: theme.colors.success,
        marginBottom: 10,
        fontSize: 16,
    },
    withDrawLoadingBtn: {
        color: theme.colors.grey9,
        marginBottom: 10,
        fontSize: 16,
        marginLeft: 6,
        paddingTop: 10,
    },
    inlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default WithDrawVestedContainer;
