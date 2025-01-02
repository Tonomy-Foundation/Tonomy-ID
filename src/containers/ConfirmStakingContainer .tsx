import { StyleSheet, Text, View } from 'react-native';
import { ConfirmStakingNavigationProp } from '../screens/ConfirmStakingScreen';
import theme from '../utils/theme';

import { IChain } from '../utils/chain/types';
import { TButtonContained } from '../components/atoms/TButton';
import { useState } from 'react';
import TSpinner from '../components/atoms/TSpinner';
import React from 'react';

export type ConfirmStakingProps = {
    navigation: ConfirmStakingNavigationProp['navigation'];
    chain: IChain;
    amount: number;
};

const ConfirmStakingContainer = ({ navigation, chain, amount }: ConfirmStakingProps) => {
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('StakeLEOSSuccess', {
                chain: chain,
            });
        }, 2000);
    };

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.confirmTitle}>Confirm staking {amount} LEOS</Text>
                <Text style={styles.confirmSubTitle}>These coins will be locked for 30 days</Text>
            </View>
            <View style={styles.proceedBtn}>
                <TButtonContained style={styles.fullWidthButton} onPressIn={handleSubmit} disabled={loading}>
                    {loading ? <TSpinner size={30} /> : 'Stake for 30 days'}
                </TButtonContained>
            </View>
        </>
    );
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        justifyContent: 'center',
        flex: 1,
    },
    confirmTitle: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
    },
    confirmSubTitle: {
        fontSize: 18,
        fontWeight: '400',
        color: theme.colors.grey9,
        textAlign: 'center',
    },
    proceedBtn: {
        paddingBottom: 20,
        paddingHorizontal: 16,
        color: theme.colors.success,
    },
    fullWidthButton: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.black,
        height: 54,
        borderRadius: 8,
    },
});

export default ConfirmStakingContainer;
