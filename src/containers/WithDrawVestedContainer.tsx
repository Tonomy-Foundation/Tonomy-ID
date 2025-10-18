import { StyleSheet, Image, View, ActivityIndicator, Text, TouchableOpacity, ScrollView } from 'react-native';
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
import { assetToAmount, KeyManagerLevel, StakingContract } from '@tonomy/tonomy-id-sdk';
import useErrorStore from '../store/errorStore';
import { getStakeUntilDate } from '../utils/time';
import settings from '../settings';

export type VestedAssetSuccessProps = {
    navigation: Props['navigation'];
    chain: IChain;
    amount: number;
    total: number;
};

const WithDrawVestedContainer = ({ navigation, chain, amount, total }: VestedAssetSuccessProps) => {
    const [loading, setLoading] = useState(false);
    const errorStore = useErrorStore();
    const [usdPrice, setUsdPrice] = useState(0);
    const [monthlyEarnings, setMonthlyEarnings] = useState('0.00');
    const token = chain.getNativeToken();
    const symbol = token.getSymbol();
    const { user } = useUserStore();

    const withDrawVested = async () => {
        try {
            setLoading(true);
            const tokenEntry = await getTokenEntryByChain(chain);

            const account = await getAccountFromChain(tokenEntry, user);
            const accountSigner = await user.getSigner(KeyManagerLevel.ACTIVE);

            await token.withdrawVestedTokens(account, accountSigner);

            navigation.navigate('SuccessVested', {
                chain,
            });
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchStakedAllocation = async () => {
            const calculatedYield = await token.getCalculatedYield(amount);
            const formattedYield = formatTokenValue(new Decimal(calculatedYield));

            setMonthlyEarnings(formattedYield);

            try {
                const usdPriceValue = await chain.getNativeToken().getUsdPrice();

                setUsdPrice(usdPriceValue);
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            } finally {
                setLoading(false);
            }
        };

        fetchStakedAllocation();
    }, [chain, amount, user, errorStore, token]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Image
                    style={{ height: 280 }}
                    resizeMode="contain"
                    source={require('../assets/images/vesting/vested-success.png')}
                />
                <Text style={styles.vestedHead}>A special offer for you!</Text>
                <TP style={styles.vestedSubHead}>
                    Stake {formatTokenValue(new Decimal(amount))} {settings.config.currencySymbol} and earn a passive
                    income
                </TP>

                <View style={styles.annualView}>
                    <View style={styles.annualText}>
                        <Text style={styles.annualSubText}>Annual Percentage Yield (APY)</Text>
                        <Text style={styles.annualPercentage}>{StakingContract.MAX_APY * 100}%</Text>
                    </View>
                    <View style={styles.annualText}>
                        <Text style={styles.annualSubText}>Monthly earnings</Text>
                        <View>
                            <Text style={styles.annualPercentage}>
                                {monthlyEarnings} {symbol}
                            </Text>
                            <Text style={styles.annualSubText}>
                                ${formatCurrencyValue(assetToAmount(monthlyEarnings + " " + symbol) * usdPrice)}
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
                        Staking is locking up cryptocurrency to increase blockchain network security and earn rewards.
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.bottomFixedView}>
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
                    size="large"
                    style={{ height: loading ? 46 : 'auto', width: '100%' }}
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

    scrollContainer: {
        paddingBottom: 150,
    },
    bottomFixedView: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'white',
        flexDirection: 'column',
        alignItems: 'center',
    },
    backBtn: {
        padding: 12,
        borderRadius: 8,
        width: '98%',
        paddingVertical: 15,
        marginBottom: 10,
        marginTop: 18,
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
        color: theme.colors.primary,
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
    withDrawLoadingBtn: {
        padding: 12,
        borderRadius: 8,
        textAlign: 'center',
        color: theme.colors.grey9,
        fontSize: 16,
    },
    withDrawBtn: {
        padding: 12,
        borderRadius: 8,
        textAlign: 'center',
        color: theme.colors.primary,
        fontSize: 16,
    },
    inlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default WithDrawVestedContainer;
