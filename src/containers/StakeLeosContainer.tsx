import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { StakeLesoscreenNavigationProp } from '../screens/StakeLeosScreen';
import theme, { commonStyles } from '../utils/theme';

import { IChain } from '../utils/chain/types';

import { TButtonContained } from '../components/atoms/TButton';
import React, { useEffect, useState } from 'react';
import useUserStore from '../store/userStore';
import { StakingAccountState } from '@tonomy/tonomy-id-sdk';
import { getAccountFromChain, getTokenEntryByChain } from '../utils/tokenRegistry';
import Decimal from 'decimal.js';

export type StakeLesoProps = {
    navigation: StakeLesoscreenNavigationProp['navigation'];
    chain: IChain;
};

const StakeLeosContainer = ({ navigation, chain }: StakeLesoProps) => {
    const token = chain.getNativeToken();
    const { user } = useUserStore();

    const [stakingState, setStakingState] = useState<StakingAccountState | null>(null);
    const [amount, setAmount] = useState('');
    const [monthlyYield, setMonthlyYield] = useState<number>(0);
    const [usdValue, setUsdValue] = useState<string>('0.00');
    const [stakingDays, setStakingDays] = useState<number | null>(null);

    useEffect(() => {
        const fetchStakingDetails = async () => {
            try {
                const tokenEntry = await getTokenEntryByChain(chain);
                const account = await getAccountFromChain(tokenEntry, user);
                console.log('account', account.getName());
                const state = await token.getStakingAccountState(account);
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
        fetchStakingDetails();
    }, [chain, user, token]);

    const handleAmountChange = async (input: string) => {
        setAmount(input);
        const numericAmount = parseFloat(input) || 0;
        if (stakingState) {
            const apy = stakingState.settings.apy || 0;
            const calculatedYield = (numericAmount * apy) / (12 * 100);
            setMonthlyYield(calculatedYield);

            // Convert to USD
            const price = await token.getUsdPrice();
            const priceDecimal = new Decimal(price);
            const inputDecimal = new Decimal(input);

            const usdValue = inputDecimal.mul(priceDecimal);
            setUsdValue((calculatedYield * usdValue.toNumber()).toFixed(2));
        }
    };

    const availableBalance = stakingState?.totalStaked.toFixed(2) ?? '0.00';
    const apy = stakingState?.settings.apy.toFixed(2) ?? '0.00';
    const stakeUntil = stakingState?.allocations[0]?.unstakeableTime.toDateString() ?? 'N/A';

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
                            <TouchableOpacity style={styles.inputButton} onPress={() => setAmount(availableBalance)}>
                                <Text style={styles.inputButtonText}>MAX</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.inputHelp}>Available: {availableBalance} LEOS</Text>
                    </View>
                    <View style={styles.annualView}>
                        <View style={styles.annualText}>
                            <Text style={styles.annualSubText}>Annual Percentage Yield (APY)</Text>
                            <Text style={styles.annualPercentage}>{apy}%</Text>
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
                                {stakeUntil} <Text style={styles.annualSubText}>({stakingDays ?? '0'} days)</Text>
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
                <TButtonContained>Proceed</TButtonContained>
            </View>
        </>
    );
};
const styles = StyleSheet.create({
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
    scrollView: { minHeight: 170, maxHeight: 350, paddingTop: 5, marginBottom: 10 },
});

export default StakeLeosContainer;
