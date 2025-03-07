import { StyleSheet, Image, View, ActivityIndicator } from 'react-native';
import { Props } from '../screens/SuccessUnstakeScreen';
import theme from '../utils/theme';
import TButton, { TButtonContained } from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import { IChain } from '../utils/chain/types';
import { useState } from 'react';

export type SuccessUnstakeProps = {
    navigation: Props['navigation'];
    chain: IChain;
};

const SuccessUnstakeContainer = ({ navigation, chain }: SuccessUnstakeProps) => {
    const [loading, setLoading] = useState(false);

    const backToLEOS = () => {
        setLoading(true);
        setTimeout(() => {
            navigation.navigate('AssetManager', {
                chain,
            });
            setLoading(false);
        }, 10000);
    };

    return (
        <View style={styles.container}>
            <Image source={require('../assets/images/staking/success-unstake.png')} />
            <TH1 style={styles.vestedHead}>{'Unstaking Completed'}</TH1>
            <TP style={styles.vestedSubHead}>Your assets have been unstaked and are no longer earning rewards</TP>
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
                        Back to LEOS
                    </TButton>
                ) : (
                    <TButtonContained style={{ width: '100%' }} onPress={() => backToLEOS()}>
                        Back to LEOS
                    </TButtonContained>
                )}
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
});

export default SuccessUnstakeContainer;
