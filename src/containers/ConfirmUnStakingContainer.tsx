import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Props } from '../screens/ConfirmUnstakingScreen';
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
import { StakingContract } from '@tonomy/tonomy-id-sdk';

export type PropsStaking = {
    navigation: Props['navigation'];
    chain: IChain;
    amount: number;
    allocationId: number;
};

const ConfirmUnStakingContainer = ({ chain, navigation, amount, allocationId }: PropsStaking) => {
    const [loading, setLoading] = useState(false);
    const { user } = useUserStore();
    const token = chain.getNativeToken();
    const errorStore = useErrorStore();

    const confirmStaking = async () => {
        try {
            setLoading(true);
            const tokenEntry = await getTokenEntryByChain(chain);

            const account = await getAccountFromChain(tokenEntry, user);

            await token.unStakeTokens(account, allocationId);

            navigation.navigate('SuccessUnstake', {
                chain,
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
                    Confirm unstaking {formatTokenValue(new Decimal(amount))} {chain.getNativeToken().getSymbol()}
                </TH1>
                <TP style={styles.vestedSubHead}>
                    Your LEOS will enter a {StakingContract.getReleaseDays()}-day release period with no yield
                </TP>
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
                        Unstake LEOS
                    </TButton>
                ) : (
                    <TButtonContained style={{ width: '100%' }} onPress={() => confirmStaking()}>
                        Unstake LEOS
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
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 120,
    },
    vestedHead: { marginBottom: 17, width: '60%', fontSize: 28, textAlign: 'center' },
    vestedSubHead: {
        textAlign: 'center',
        width: '80%',
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

export default ConfirmUnStakingContainer;
