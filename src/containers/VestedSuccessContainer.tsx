import { StyleSheet, Image, View } from 'react-native';
import { Props } from '../screens/VestedSuccessScreen';
import theme from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import { IChain } from '../utils/chain/types';
import useUserStore from '../store/userStore';
import { useEffect, useState } from 'react';
import { getAccountFromChain, getTokenEntryByChain } from '../utils/tokenRegistry';
import useErrorStore from '../store/errorStore';
import TSpinner from '../components/atoms/TSpinner';
import settings from '../settings';

export type SuccessVestedProps = {
    navigation: Props['navigation'];
    chain: IChain;
};

const VestedSuccessContainer = ({ navigation, chain }: SuccessVestedProps) => {
    const [totalLocked, setTotalLocked] = useState(0);
    const [loading, setLoading] = useState(true);
    const token = chain.getNativeToken();
    const { user } = useUserStore();
    const errorStore = useErrorStore();

    useEffect(() => {
        const fetchVestedAllocation = async () => {
            try {
                setLoading(true);

                const tokenEntry = await getTokenEntryByChain(chain);

                const account = await getAccountFromChain(tokenEntry, user);

                const allocations = await token.getVestedTokens(account);

                setTotalLocked(allocations.locked);
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            } finally {
                setLoading(false);
            }
        };

        fetchVestedAllocation();
    }, [chain, token, user, errorStore]);

    const redirectBack = () => {
        setLoading(true);

       setTimeout(() => {
        if (totalLocked > 0) {
            navigation.navigate('VestedAssets', { chain });
        } else {
            navigation.navigate('AssetManager', { chain });
        }
        
        setLoading(false);
    }, 8000); 
    };

    return (
        <View style={styles.container}>
            <Image source={require('../assets/images/staking/success-stake.png')} />
            <TH1 style={styles.vestedHead}>{'Vested and Rested'}</TH1>
            <TP style={styles.vestedSubHead}>Your coins have been successfully withdrawn!</TP>
            <View style={styles.bottomView}>
                <TButtonContained
                    loading={loading}
                    disabled={loading}
                    style={{ width: '100%' }}
                    size="large"
                    onPress={() => redirectBack()}
                >
                    Back to {settings.config.currencySymbol}
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
        marginTop: 20,
    },
    vestedHead: { marginTop: 8, marginBottom: 0, paddingHorizontal: 20 },
    vestedSubHead: {
        paddingHorizontal: 25,
        fontSize: 17,
        textAlign: 'center',
        marginTop: 7,
        color: theme.colors.grey9,
    },
    bottomView: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
    },
    backBtn: {
        borderRadius: 6,
        backgroundColor: theme.colors.backgroundGray,
        width: '94%',
        paddingVertical: 15,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default VestedSuccessContainer;
