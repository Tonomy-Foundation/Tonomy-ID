import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from './TIconButton';
import theme from '../utils/theme';
import TButton from './atoms/TButton';
import { IChain } from '../utils/chain/types';
import { assetToAmount, StakingAccountState, StakingAllocation, StakingContract } from '@tonomy/tonomy-id-sdk';
import { formatCurrencyValue, formatTokenValue } from '../utils/numbers';
import { formatDate } from '../utils/time';
import Decimal from 'decimal.js';
import HowStakingWorks from './HowStakingWorks';
import { Props } from '../screens/StakeAssetDetailScreen';

export type PropsStaking = {
    refMessage: React.RefObject<any>;
    onClose: () => void;
    navigation: Props['navigation'];
    chain: IChain;
    allocation: StakingAllocation;
    usdPrice: number;
    accountData: StakingAccountState;
};

const StakingAllocationDetails = (props: PropsStaking) => {
    const allocation = props.allocation;
    const accountData = props.accountData;
    const isUnlocked = new Date() >= new Date(allocation.unstakeableTime);
    const symbol = props.chain.getNativeToken().getSymbol();
    const requestUnstakeToken = () => {
        props.onClose();
        props.navigation.navigate('ConfirmUnStaking', {
            chain: props.chain,
            amount: assetToAmount(allocation.staked),
            allocationId: allocation.id,
        });
    };
    const refHowStaking = useRef<{ open: () => void; close: () => void }>(null);

    const openHowStakingSheet = () => {
        props.refMessage?.current?.close();
        setTimeout(() => {
            refHowStaking.current?.open();
        }, 220);
    };

    return (
        <>
            <RBSheet
                ref={props.refMessage}
                openDuration={150}
                closeDuration={100}
                height={500}
                customStyles={{ container: { paddingHorizontal: 10 } }}
            >
                <View style={styles.vestHead}>
                    <Text style={styles.drawerHead}>Staking details</Text>
                    <TouchableOpacity onPress={props.onClose}>
                        <TIconButton
                            icon={'close'}
                            color={theme.colors.lightBg}
                            iconColor={theme.colors.grey1}
                            size={17}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.vestingDetailView}>
                    <View style={styles.allocationView}>
                        <Text style={styles.allocTitle}>Staked</Text>
                        <View style={styles.flexColCenter}>
                            <Text style={styles.allocMulti}>
                                {allocation.staked && formatTokenValue(new Decimal(assetToAmount(allocation.staked)))}{' '}
                                {symbol}
                            </Text>
                            <Text style={styles.usdBalance}>
                                $
                                {allocation.staked &&
                                    formatCurrencyValue(assetToAmount(allocation.staked) * props.usdPrice)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.allocationView}>
                        <Text style={styles.allocTitle}>Yield so far</Text>
                        <View style={styles.flexColCenter}>
                            <Text style={styles.allocMulti}>
                                <Text style={{ color: theme.colors.primary }}>
                                    +
                                    {allocation.initialStake &&
                                        allocation.yieldSoFar &&
                                        (
                                            (assetToAmount(allocation.yieldSoFar) /
                                                assetToAmount(allocation.initialStake)) *
                                            100
                                        ).toFixed(2)}
                                    %
                                </Text>
                            </Text>
                        </View>
                    </View>

                    <View style={styles.allocationView}>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Text style={styles.allocTitle}>Monthly yield:</Text>
                            <Text style={styles.allocTitle}>({(accountData.settings.apy * 100).toFixed(2)}% APY)</Text>
                        </View>

                        <View style={styles.flexColCenter}>
                            <Text style={[styles.allocMulti, { color: theme.colors.primary }]}>
                                {allocation.monthlyYield &&
                                    formatTokenValue(new Decimal(assetToAmount(allocation.monthlyYield)))}{' '}
                                {symbol}
                            </Text>
                            <Text style={styles.usdBalance}>
                                $
                                {allocation?.monthlyYield &&
                                    formatCurrencyValue(assetToAmount(allocation.monthlyYield) * props.usdPrice)}
                            </Text>
                        </View>
                    </View>
                    {isUnlocked ? (
                        <View style={styles.allocationView}>
                            <Text style={styles.allocTitle}>Stake started</Text>
                            <View style={styles.flexColEnd}>
                                <Text style={styles.allocMulti}>
                                    {allocation.stakedTime && formatDate(allocation.stakedTime)}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.allocationView}>
                            <Text style={styles.allocTitle}>Locked until</Text>
                            <View style={styles.flexColEnd}>
                                <Text style={styles.allocMulti}>
                                    {allocation.unstakeableTime && formatDate(allocation.unstakeableTime)}
                                    <Text style={{ color: theme.colors.grey9 }}>
                                        {' '}
                                        ({StakingContract.getLockedDays()} days)
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.unlockAssetView}>
                    <Text style={styles.unlockhead}>How does yield work?</Text>

                    <Text style={styles.lockedParagraph}>
                        Yield is compounded daily based on the current yield rate multiplied by your stake amount
                    </Text>
                    <Text style={styles.howStaking} onPress={() => openHowStakingSheet()}>
                        How Staking Works
                    </Text>
                </View>
                {isUnlocked && !allocation.unstakeRequested && (
                    <View style={styles.stakeMoreBtn}>
                        <TButton
                            style={styles.unstakeBtnCombined}
                            color={theme.colors.black}
                            onPress={() => requestUnstakeToken()}
                        >
                            Unstake
                        </TButton>
                    </View>
                )}
            </RBSheet>
            <HowStakingWorks refMessage={refHowStaking} />
        </>
    );
};

const styles = StyleSheet.create({
    vestHead: {
        paddingHorizontal: 5,
        paddingVertical: 13,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    drawerHead: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 8,
    },
    howView: {
        alignItems: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.grey7,
        marginTop: 17,
        borderRadius: 8,
    },
    howHead: {
        fontSize: 16,
        fontWeight: '700',
        alignItems: 'flex-start',
    },
    howParagraph: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.black,
        marginTop: 5,
    },
    vestingDetailView: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        paddingHorizontal: 13,
        paddingBottom: 30,
        paddingTop: 6,
    },
    allocationView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 17,
    },
    allocMulti: { color: theme.colors.black, fontWeight: '500', fontSize: 13 },
    usdBalance: { color: theme.colors.grey9, fontWeight: '400', fontSize: 12 },
    flexColEnd: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    flexColCenter: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    allocTitle: { fontWeight: '400', color: theme.colors.grey9, fontSize: 14 },
    flexRowCenter: {
        flexDirection: 'row',
        gap: 7,
        alignItems: 'flex-end',
    },
    unlockAssetView: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.grey7,
        borderRadius: 8,
        position: 'absolute',
        bottom: 75,
        left: 0,
        right: 0,
        marginHorizontal: 10,
    },
    unlockhead: {
        fontSize: 16,
        fontWeight: '700',
        alignItems: 'flex-start',
    },
    lockedParagraph: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.black,
        marginTop: 6,
    },
    howStaking: {
        fontSize: 13,
        fontWeight: '400',
        color: theme.colors.primary,
        marginTop: 6,
    },
    stakeMoreBtn: {
        position: 'absolute',
        bottom: 20,
        left: 13,
        right: 13,
    },
    unstakeBtn: {
        borderRadius: 6,
        backgroundColor: theme.colors.backgroundGray,
        width: '100%',
        paddingVertical: 14,
    },
    unstakeBtnCombined: {
        borderRadius: 6,
        backgroundColor: theme.colors.backgroundGray,
        width: '100%',
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
export default StakingAllocationDetails;
