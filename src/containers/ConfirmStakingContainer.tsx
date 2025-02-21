import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Props } from '../screens/ConfirmStakingScreen';
import theme from '../utils/theme';
import TButton, { TButtonContained } from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import { IChain } from '../utils/chain/types';
import { useState } from 'react';
import { formatTokenValue } from '../utils/numbers';
import Decimal from 'decimal.js';
import { getAccountFromChain, getTokenEntryByChain } from '../utils/tokenRegistry';
import useUserStore from '../store/userStore';
import useErrorStore from '../store/errorStore';

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

    const confirmStaking = async () => {
        setLoading(true);

        try {
            const tokenEntry = await getTokenEntryByChain(chain);

            const account = await getAccountFromChain(tokenEntry, user);

            if (withDraw) {
                await token.withdrawVestedTokens(account);
            }

            const quantity = amount.toFixed(6) + ' ' + token.getSymbol();

            await token.stakeTokens(account, quantity);
            navigation.navigate('StakeLeosDetail', {
                chain,
                loading: true,
            });
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <View style={styles.container}>
                <TH1 style={styles.vestedHead}>
                    Confirm staking {formatTokenValue(new Decimal(amount))} {chain.getNativeToken().getSymbol()}
                </TH1>
                <TP style={styles.vestedSubHead}>These coins will be locked for 14 days</TP>
            </View>
            <View style={styles.bottomView}>
                {loading ? (
                    <TButton
                        style={[
                            styles.backBtn,
                            { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
                        ]}
                        color={theme.colors.grey3}
                    >
                        <ActivityIndicator size="small" color={theme.colors.grey3} style={{ marginRight: 7 }} />
                        Stake for 14 days
                    </TButton>
                ) : (
                    <TButtonContained style={{ width: '100%' }} onPress={() => confirmStaking()}>
                        Stake for 14 days
                    </TButtonContained>
                )}
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
