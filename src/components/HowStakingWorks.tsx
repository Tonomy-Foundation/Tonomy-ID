import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from './TIconButton';
import theme from '../utils/theme';
import { StakingContract } from '@tonomy/tonomy-id-sdk';
import settings from '../settings';

export type Props = {
    refMessage: React.RefObject<{ open: () => void; close: () => void } | null>;
};

const HowStakingWorks = (props: Props) => {
    return (
        <RBSheet
            ref={props.refMessage}
            openDuration={150}
            closeDuration={100}
            height={470}
            customStyles={{ container: { paddingHorizontal: 16 } }}
        >
            <View style={styles.vestHead}>
                <Text style={styles.drawerHead}>Staking information</Text>
                <TouchableOpacity onPress={() => props.refMessage.current?.close()}>
                    <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} size={17} />
                </TouchableOpacity>
            </View>
            <View>
                <Text style={styles.heading}>What is staking?</Text>
                <Text style={styles.paragragh}>
                    Staking {settings.config.currencySymbol} lets you earn rewards by locking tokens for a set period
                </Text>
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={styles.heading}>How Does Staking Work?</Text>
                <Text style={styles.paragragh}>
                    {settings.config.currencySymbol} is{' '}
                    <Text style={styles.boldText}>
                        locked for {StakingContract.getLockedDays()} days. Yield rewards
                    </Text>{' '}
                    are distributed daily and auto-compounded
                </Text>
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={styles.heading}>Unlocking Staked {settings.config.currencySymbol}</Text>
                <Text style={styles.paragragh}>
                    After the <Text style={styles.boldText}>{StakingContract.getLockedDays()} days lockup</Text>, you
                    can unlock your {settings.config.currencySymbol} at any time. Unlocking starts{' '}
                    <Text style={styles.boldText}>a {StakingContract.getReleaseDays()}-day release period </Text>with
                    <Text style={styles.boldText}> no yield</Text>
                </Text>
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={styles.heading}>Yield and APY</Text>
                <Text style={styles.paragragh}>
                    <Text style={styles.boldText}>Variable APY</Text> based on total staked{' '}
                    {settings.config.currencySymbol}. The{' '}
                    <Text style={styles.boldText}>maximum APY is {StakingContract.MAX_APY * 100}%</Text>
                </Text>
            </View>
        </RBSheet>
    );
};

const styles = StyleSheet.create({
    vestHead: {
        paddingVertical: 13,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    drawerHead: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 8,
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 17,
    },
    paragragh: {
        fontSize: 13,
        marginTop: 8,
    },
    boldText: {
        fontWeight: 'bold',
    },
});

export default HowStakingWorks;
