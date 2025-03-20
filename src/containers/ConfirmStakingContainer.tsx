import { StyleSheet, View } from 'react-native';
import { Props } from '../screens/ConfirmStakingScreen';
import theme from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import { IChain } from '../utils/chain/types';
import { useState } from 'react';
import { formatTokenValue } from '../utils/numbers';
import Decimal from 'decimal.js';
import { getAccountFromChain, getTokenEntryByChain } from '../utils/tokenRegistry';
import useUserStore from '../store/userStore';
import useErrorStore from '../store/errorStore';
import { amountToAsset, KeyManagerLevel, StakingContract } from '@tonomy/tonomy-id-sdk';
import TSpinner from '../components/atoms/TSpinner';

export type PropsStaking = {
    navigation: Props['navigation'];
    chain: IChain;
    amount: number;
    withDraw?: boolean;
};

const ConfirmStakingContainer = ({ chain, navigation, amount, withDraw }: PropsStaking) => {
    const [loading, setLoading] = useState(false);
    const { user } = useUserStore();
    const token = chain.getNativeToken();
    const errorStore = useErrorStore();
    const lockedDays = StakingContract.getLockedDays();

    const confirmStaking = async () => {
        setLoading(true);

        try {
            const tokenEntry = await getTokenEntryByChain(chain);

            const account = await getAccountFromChain(tokenEntry, user);
            const accountSigner = await user.getSigner(KeyManagerLevel.ACTIVE);
            let stakeAmount;

            if (withDraw) {
                const allocations = await token.getVestedTokens(account);

                stakeAmount = allocations.unlockable;

                await token.withdrawVestedTokens(account, accountSigner);
                await new Promise((resolve) => setTimeout(resolve, 10000));
            } else {
                stakeAmount = amount;
            }

            const formattedAmount = amountToAsset(stakeAmount, token.getSymbol());

            await token.stakeTokens(account, formattedAmount, accountSigner);
            setTimeout(() => {
                navigation.navigate('AssetManager', {
                    chain,
                });
                setLoading(false);
            }, 10000);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
            setLoading(false);
        }
    };

    return (
        <>
            <View style={styles.container}>
                <TH1 style={styles.vestedHead}>
                    Confirm staking {formatTokenValue(new Decimal(amount))} {chain.getNativeToken().getSymbol()}
                </TH1>
                <TP style={styles.vestedSubHead}>These coins will be locked for {lockedDays} days</TP>
            </View>
            <View style={styles.bottomView}>
                <TButtonContained
                    style={{ height: loading ? 46 : 'auto', width: '100%' }}
                    size="large"
                    onPress={() => confirmStaking()}
                    disabled={loading}
                >
                    {loading ? <TSpinner size={40} /> : `Stake for ${lockedDays} days`}
                </TButtonContained>
            </View>
        </>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 120,
    },
    vestedHead: { marginBottom: 17, width: '60%', fontSize: 28, textAlign: 'center' },
    vestedSubHead: {
        textAlign: 'center',
        width: '60%',
        marginTop: 7,
        fontSize: 18,
        color: theme.colors.grey9,
    },
    bottomView: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backBtn: {
        borderRadius: 6,
        backgroundColor: theme.colors.grey5,
        width: '100%',
        paddingVertical: 15,
    },
});

export default ConfirmStakingContainer;
