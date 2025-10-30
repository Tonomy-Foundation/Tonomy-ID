import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from './TIconButton';
import theme from '../utils/theme';
import { VestedAllocation } from '../utils/chain/types';
import { formatCurrencyValue, formatTokenValue } from '../utils/numbers';
import Decimal from 'decimal.js';
import settings from '../settings';
import { formatDate } from '../utils/time';
import { calculateMonthlyUnlock } from '../utils/vesting';

export type Props = {
    refMessage: React.RefObject<any>;
    onClose: () => void;
    allocationData: VestedAllocation;
    usdPriceValue: number;
    initialUnlockDate: Date | null;
};

const AllocationDetails = (props: Props) => {
    const allocationData = props.allocationData;

    return (
        <RBSheet
            ref={props.refMessage}
            openDuration={150}
            closeDuration={100}
            height={525}
            customStyles={{ container: { paddingHorizontal: 10 } }}
        >
            <View style={styles.vestHead}>
                <Text style={styles.drawerHead}>Vesting Allocation</Text>
                <TouchableOpacity onPress={props.onClose}>
                    <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} size={17} />
                </TouchableOpacity>
            </View>
            <View style={styles.vestingDetailView}>
                <View style={styles.allocationView}>
                    <Text style={styles.allocTitle}>Vested assets</Text>
                    <View style={styles.flexColCenter}>
                        <Text style={styles.allocMulti}>
                            {formatTokenValue(new Decimal(allocationData.locked ?? 0))} {settings.config.currencySymbol}
                        </Text>
                        <Text style={styles.usdBalance}>
                            ${formatCurrencyValue(allocationData.locked * props.usdPriceValue)}
                        </Text>
                    </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.allocationView}>
                    <Text style={styles.allocTitle}>Initial allocation</Text>
                    <View style={styles.flexColCenter}>
                        <Text style={styles.allocMulti}>
                            {formatTokenValue(new Decimal(allocationData.totalAllocation ?? 0))}{' '}
                            {settings.config.currencySymbol}
                        </Text>
                        <Text style={styles.usdBalance}>
                            ${formatCurrencyValue(allocationData.totalAllocation * props.usdPriceValue)}
                        </Text>
                    </View>
                </View>
                <View style={styles.allocationView}>
                    <Text style={styles.allocTitle}>Initial unlock</Text>
                    <View style={styles.flexColEnd}>
                        <Text style={styles.allocMulti}>{allocationData.unlockAtVestingStart * 100}%</Text>
                    </View>
                </View>
                <View style={styles.allocationView}>
                    <Text style={styles.allocTitle}>Initial unlock date</Text>
                    <View style={styles.flexColEnd}>
                        <Text style={styles.allocMulti}>
                            {props.initialUnlockDate && formatDate(props.initialUnlockDate)}
                        </Text>
                    </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.allocationView}>
                    <Text style={styles.allocTitle}>Vesting start</Text>
                    <View style={styles.flexColEnd}>
                        <Text style={styles.allocMulti}>
                            {allocationData?.vestingStart && formatDate(allocationData?.vestingStart)}
                        </Text>
                    </View>
                </View>

                <View style={styles.allocationView}>
                    <Text style={styles.allocTitle}>Vesting period</Text>
                    <View style={styles.flexColEnd}>
                        <Text style={styles.allocMulti}>{allocationData.vestingPeriod}</Text>
                    </View>
                </View>
                {calculateMonthlyUnlock(allocationData) > 0 && (
                    <View style={styles.allocationView}>
                        <Text style={styles.allocTitle}>Vesting unlock per month</Text>
                        <View style={styles.flexColEnd}>
                            <Text style={styles.allocMulti}>{calculateMonthlyUnlock(allocationData)}%</Text>
                        </View>
                    </View>
                )}
            </View>
            <View style={styles.howView}>
                <Text style={styles.howHead}>How vesting works</Text>
                <Text style={styles.howParagraph}>
                    Vesting gradually unlocks your {settings.config.currencySymbol} tokens over a set period, ensuring
                    long-term commitment and alignment with the project&apos;s goals
                </Text>
            </View>
        </RBSheet>
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
        paddingBottom: 20,
        paddingTop: 3,
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
    allocTitle: { fontWeight: '500', color: theme.colors.grey9, fontSize: 14 },
    flexRowCenter: {
        flexDirection: 'row',
        gap: 7,
        alignItems: 'flex-end',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.grey8,
        marginVertical: 8,
        alignSelf: 'stretch',
        opacity: 0.6,
    },
});

export default AllocationDetails;
