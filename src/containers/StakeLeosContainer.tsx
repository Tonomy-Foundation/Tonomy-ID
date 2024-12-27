import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { StakeLesoscreenNavigationProp } from '../screens/StakeLeosScreen';
import theme, { commonStyles } from '../utils/theme';

import { IChain } from '../utils/chain/types';
import { useEffect, useState } from 'react';
import { AccountTokenDetails, getAssetDetails } from '../utils/tokenRegistry';
import { AntelopeAccount, PangeaMainnetChain, PangeaVestedToken } from '../utils/chain/antelope';
import TSpinner from '../components/atoms/TSpinner';
import { TButtonContained } from '../components/atoms/TButton';

export type StakeLesoProps = {
    navigation: StakeLesoscreenNavigationProp['navigation'];
    chain: IChain;
};

const StakeLeosContainer = ({ navigation, chain }: StakeLesoProps) => {
    const [asset, setAsset] = useState<AccountTokenDetails>({} as AccountTokenDetails);
    const [balance, setBalance] = useState({
        availableBalance: '',
        availableBalanceUsd: 0,
        vestedBalance: '',
        vestedBalanceUsd: 0,
    });
    const [loading, setLoading] = useState(true);
    const token = chain.getNativeToken() as PangeaVestedToken;
    const [amount, setAmount] = useState('');
    const [apy, setApy] = useState(0);

    const [monthlyEarningsLeos, setMonthlyEarningsLeos] = useState(0);
    const [monthlyEarningsUsd, setMonthlyEarningsUsd] = useState(0);
    const calculateEarnings = (stakingAmount: number) => {
        const monthlyEarnings = (stakingAmount * apy) / 1200;
        const monthlyEarningsInUsd = monthlyEarnings * balance.availableBalanceUsd;

        setMonthlyEarningsLeos(monthlyEarnings);
        setMonthlyEarningsUsd(monthlyEarningsInUsd);
    };
    const handleMaxAmount = () => {
        setAmount(balance.availableBalanceUsd.toFixed(2));
    };

    const MINIMUM_STAKE_AMOUNT = 50000;
    const [errorMessage, setErrorMessage] = useState('');
    const handleAmountChange = (val: string) => {
        const numericValue = parseFloat(val);

        if (numericValue > parseFloat(balance.availableBalance)) {
            setErrorMessage('Not enough balance.');
        } else if (numericValue < MINIMUM_STAKE_AMOUNT) {
            setErrorMessage(`Minimum stake amount is ${MINIMUM_STAKE_AMOUNT.toLocaleString()} LEOS.`);
        }

        setAmount(val);
    };

    useEffect(() => {
        const fetchAssetDetails = async () => {
            const assetData = await getAssetDetails(chain);
            const account = AntelopeAccount.fromAccount(PangeaMainnetChain, assetData.account);
            const availableBalance = await token.getAvailableBalance(account);
            const availableBalanceUsd = await availableBalance.getUsdValue();
            const vestedBalance = await token.getVestedTotalBalance(account);
            const vestedBalanceUsd = await vestedBalance.getUsdValue();

            setBalance({
                availableBalance: availableBalance.toString(),
                vestedBalance: vestedBalance.toString(),
                availableBalanceUsd,
                vestedBalanceUsd,
            });

            setAsset(assetData);
            setLoading(false);
        };

        fetchAssetDetails();
        const interval = setInterval(fetchAssetDetails, 10000);

        return () => clearInterval(interval);
    }, [chain, token]);

    if (loading) {
        return (
            <View style={styles.textContainer}>
                <TSpinner />
            </View>
        );
    }

    return (
        <>
            <View style={styles.container}>
                <View style={styles.flexCol}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter amount"
                            onChangeText={handleAmountChange}
                            value={amount}
                            placeholderTextColor={theme.colors.tabGray}
                        />
                        <TouchableOpacity style={styles.inputButton} onPress={handleMaxAmount}>
                            <Text style={styles.inputButtonText}>MAX</Text>
                        </TouchableOpacity>
                    </View>
                    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                    <Text style={styles.inputHelp}>Available: {balance.availableBalance}</Text>
                </View>
                <View style={styles.annualView}>
                    <View style={styles.annualText}>
                        <Text style={styles.annualSubText}>Annual Percentage Yield (APY)</Text>
                        <Text style={styles.annualPercentage}>{apy.toFixed(2)}%</Text>
                    </View>
                    <View style={styles.annualText}>
                        <Text style={styles.annualSubText}>Monthly earnings</Text>
                        <View>
                            <Text style={styles.annualPercentage}>{monthlyEarningsLeos.toFixed(2)} LEOS</Text>
                            <Text style={styles.annualSubText}>${monthlyEarningsUsd.toFixed(2)}</Text>
                        </View>
                    </View>
                    <View style={styles.annualText}>
                        <Text style={styles.annualSubText}>Stake until</Text>
                        <Text>
                            3 Nov 2024 <Text style={styles.annualSubText}>(30 days)</Text>
                        </Text>
                    </View>
                </View>
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
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
        ...commonStyles.secondaryFontFamily,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
});

export default StakeLeosContainer;
