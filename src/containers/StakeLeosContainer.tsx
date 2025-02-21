import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { StakeLesoscreenNavigationProp } from '../screens/StakeLeosScreen';
import theme, { commonStyles } from '../utils/theme';

import { IChain } from '../utils/chain/types';

import { TButtonContained } from '../components/atoms/TButton';
import useUserStore from '../store/userStore';
import { useEffect, useState } from 'react';
import { StakingAccountState, StakingContract } from '@tonomy/tonomy-id-sdk';
import { getAccountFromChain, getAssetDetails, getTokenEntryByChain } from '../utils/tokenRegistry';
import Decimal from 'decimal.js';
import settings from '../settings';
import { AntelopeAccount, AntelopeChain } from '../utils/chain/antelope';
import { getStakeUntilDate } from '../utils/time';

export type StakeLesoProps = {
    navigation: StakeLesoscreenNavigationProp['navigation'];
    chain: IChain;
};

interface Balance {
    availableBalance: string;
    availableBalanceUsd: number;
}

const StakeLeosContainer = ({ navigation, chain }: StakeLesoProps) => {
    const token = chain.getNativeToken();
    const { user } = useUserStore();

    const [stakingState, setStakingState] = useState<StakingAccountState | null>(null);
    const [amount, setAmount] = useState('');
    const [monthlyYield, setMonthlyYield] = useState<number>(0);
    const [usdValue, setUsdValue] = useState<string>('0.00');
    const [stakingDays, setStakingDays] = useState<number | null>(null);
    const minimumStakeTransfer = settings.isProduction() ? 1000 : 1;
    const [amountError, setAmountError] = useState<string | null>(null);

    const symbol = chain.getNativeToken().getSymbol();
    const isVestable = chain.getNativeToken().isVestable();

    const [availableBalance, setAvailableBalance] = useState<string>('0.00');

    useEffect(() => {
        const fetchAssetsDetails = async () => {
            try {
                const assetData = await getAssetDetails(chain);

                if (isVestable) {
                    const account = AntelopeAccount.fromAccount(chain as AntelopeChain, assetData.account);
                    const availableBalance = await token.getAvailableBalance(account);

                    setAvailableBalance(availableBalance.getAmount().toString());
                } else {
                    setAvailableBalance(assetData.token.balance);
                }

                const tokenEntry = await getTokenEntryByChain(chain);
                const account = await getAccountFromChain(tokenEntry, user);
                const state = await token.getAccountStateData(account);

                setStakingState(state);

                if (state.allocations.length > 0) {
                    const unstakeDate = state.allocations[0].unstakeableTime;
                    const today = new Date();
                    const diffDays = Math.ceil((unstakeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    setStakingDays(diffDays > 0 ? diffDays : 0);
                }
            } catch (error) {
                console.error('Error fetching staking details:', error);
            }
        };

        fetchAssetsDetails();
    }, [chain, user, token, isVestable]);

    const apy = stakingState?.settings.apy ?? StakingContract.MAX_APY;
    const stakeUntil = stakingState?.allocations[0]?.unstakeableTime.toDateString() ?? getStakeUntilDate();
    const shouldShowMinStakeMessage = !amountError || amountError === 'Not enough balance';

    console.log(JSON.stringify(stakingState, null, 2));

    const handleAmountChange = async (input: string) => {
        setAmount(input);
        const numericAmount = parseFloat(input) || 0;

        let errorMessage: string | null = null;

        if (numericAmount > parseFloat(availableBalance)) {
            errorMessage = 'Not enough balance';
        } else if (numericAmount < minimumStakeTransfer) {
            errorMessage = `Minimum stake: ${minimumStakeTransfer.toFixed(3)} LEOS`;
        }

        setAmountError(errorMessage);

        const calculatedYield = numericAmount * (Math.pow(1 + StakingContract.MAX_APY, 1 / 12) - 1);

        setMonthlyYield(calculatedYield);

        // Convert to USD
        const usdPriceValue = await chain.getNativeToken().getUsdPrice();

        setUsdValue((calculatedYield * usdPriceValue).toFixed(2));
    };

    const handleMaxPress = () => {
        setAmount(availableBalance);
        handleAmountChange(availableBalance);
    };

    const handleProceed = () => {
        if (amountError || !amount || parseFloat(amount) < minimumStakeTransfer) {
            Alert.alert('Invalid Input', amountError || `Minimum stake is ${minimumStakeTransfer.toFixed(4)} LEOS`);
            return;
        }

        navigation.navigate('ConfirmStaking', {
            chain: chain,
            amount: parseFloat(amount) || 0,
        });
    };

    return (
        <>
            <View style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.flexCol}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter amount"
                                placeholderTextColor={theme.colors.tabGray}
                                value={amount}
                                onChangeText={handleAmountChange}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity style={styles.inputButton} onPress={handleMaxPress}>
                                <Text style={styles.inputButtonText}>MAX</Text>
                            </TouchableOpacity>
                        </View>
                        {amountError && <Text style={styles.errorText}>{amountError}</Text>}
                        {shouldShowMinStakeMessage && (
                            <Text style={styles.inputHelp}>Minimum stake: {minimumStakeTransfer.toFixed(4)} LEOS</Text>
                        )}
                    </View>
                    <View style={styles.annualView}>
                        <View style={styles.annualText}>
                            <Text style={styles.annualSubText}>Annual Percentage Yield (APY)</Text>
                            <Text style={styles.annualPercentage}>{apy * 100}%</Text>
                        </View>
                        <View style={styles.annualText}>
                            <Text style={styles.annualSubText}>Monthly earnings</Text>
                            <View>
                                <Text style={styles.annualPercentage}>{monthlyYield.toFixed(2)} LEOS</Text>
                                <Text style={styles.annualSubText}>${usdValue}</Text>
                            </View>
                        </View>
                        <View style={styles.annualText}>
                            <Text style={styles.annualSubText}>Stake until</Text>
                            <Text>
                                {stakeUntil} <Text style={styles.annualSubText}>({stakingDays ?? '14'} days)</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
            <View style={styles.unlockAssetView}>
                <Text style={styles.unlockhead}>What is staking? </Text>
                <Text style={styles.lockedParagraph}>
                    Staking is locking up cryptocurrency to increase blockchain network security and earn rewards
                </Text>
            </View>
            <View style={styles.proceedBtn}>
                <TButtonContained onPress={handleProceed} disabled={amountError !== null || amount === ''}>
                    Proceed
                </TButtonContained>
            </View>
        </>
    );
};
const styles = StyleSheet.create({
    scrollView: { minHeight: 170, maxHeight: 350, paddingTop: 5, marginBottom: 10 },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginTop: 10,
        gap: 24,
    },
    flexCol: {
        flexDirection: 'column',
        gap: 8,
    },
    unlockAssetView: {
        alignItems: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.grey7,
        marginVertical: 16,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    annualView: {
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: theme.colors.grey7,
        borderRadius: 6,
        marginTop: 10,
    },
    annualText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 12,
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
    inputContainer: {
        borderColor: theme.colors.grey8,
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    input: {
        height: 48,
        width: '100%',
        padding: 10,
        fontSize: 15,
        backgroundColor: theme.colors.white,
        flexShrink: 1,
        borderRadius: 6,
    },
    inputButton: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginRight: 10,
        flexShrink: 0,
    },
    inputButtonText: {
        color: theme.colors.success,
        fontSize: 15,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    inputHelp: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.tabGray,
        ...commonStyles.secondaryFontFamily,
    },
    proceedBtn: {
        padding: 16,
        marginBottom: 20,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        fontWeight: '400',
        ...commonStyles.secondaryFontFamily,
    },
});

export default StakeLeosContainer;
