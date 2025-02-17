import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Props } from '../screens/StakeAssetDetailScreen';
import { IChain } from '../utils/chain/types';
import theme, { commonStyles } from '../utils/theme';
import TButton, { TButtonContained } from '../components/atoms/TButton';
import { NavArrowRight } from 'iconoir-react-native';
import { useRef, useState } from 'react';
import StakingAllocationDetails from '../components/StakingAllocationDetails';

export type StakingLeosProps = {
    navigation: Props['navigation'];
    chain: IChain;
};

const StakeAssetDetailContainer = ({ navigation, chain }: StakingLeosProps) => {
    const [selectedAllocation, setSelectedAllocation] = useState<Record<string, any>>({});
    const refMessage = useRef<{ open: () => void; close: () => void }>(null);
    const onClose = () => {
        refMessage.current?.close();
    };

    return (
        <View style={styles.container}>
            <View style={styles.yieldRow}>
                <View style={styles.flexStartCol}>
                    <Text style={styles.cryptoMsg}>{'Your crypto is working hard!'}</Text>
                    <Text style={styles.cryptoEarned}>{`100.0000 LEOS earned`}</Text>
                </View>
            </View>
            <Text style={styles.subTitle}>Total staked</Text>

            <View style={styles.stakeView}>
                <View style={styles.row}>
                    <View style={styles.flexStartCol}>
                        <Text style={styles.lockedCoinsAmount}>{`69,023.35 LEOS`}</Text>
                        <Text style={styles.lockedUSDAmount}>{`= $3273.1`}</Text>
                    </View>
                    <View style={styles.flexEndCol}>
                        <Text style={styles.apyPercentage}>3.48% APY</Text>
                        <Text style={styles.leosMonthly}>180.00 LEOS / month</Text>
                    </View>
                </View>
                <View style={styles.stakeMoreBtn}>
                    <TButtonContained style={styles.fullWidthButton}>Stake more</TButtonContained>
                </View>
            </View>

            <TouchableOpacity
                style={styles.allocationView}
                onPress={() => {
                    setSelectedAllocation({});
                    refMessage.current?.open();
                }}
            >
                <Text style={{ fontWeight: '700' }}>6,000.00 LEOS</Text>
                <View style={styles.flexColEnd}>
                    <Text style={styles.allocMulti}>unlockable in 15 days</Text>

                    <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                </View>
            </TouchableOpacity>

            {selectedAllocation && (
                <StakingAllocationDetails
                    chain={chain}
                    onClose={onClose}
                    refMessage={refMessage}
                    navigation={navigation}
                />
            )}
            <TouchableOpacity style={styles.allocationView}>
                <Text style={{ fontWeight: '700' }}>6,000.00 LEOS</Text>
                <View style={styles.flexColEnd}>
                    <Text style={styles.allocMulti}>unlockable in 15 days</Text>
                    <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.allocationView}>
                <Text style={{ fontWeight: '700' }}>6,000.00 LEOS</Text>
                <View style={styles.flexColEnd}>
                    <Text style={styles.allocMulti}>released in 5 days</Text>
                    <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                </View>
            </TouchableOpacity>

            <View style={styles.unlockAssetView}>
                <Text style={styles.unlockhead}>Why are my coins locked?</Text>

                <Text style={styles.lockedParagraph}>
                    These coins are locked during the staking period to support the network and earn rewards. Coins will
                    be fully unlockable in 14 days after they are staked
                </Text>
                <Text style={styles.howStaking}>How Staking Works</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 15,
    },
    yieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: theme.colors.backgroundGray,
        paddingHorizontal: 15,
        paddingVertical: 20,
        borderRadius: 8,
        // Android shadow
        elevation: 4,

        // iOS shadow
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    flexStartCol: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    stakeView: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        paddingVertical: 18,
        paddingHorizontal: 15,
        marginBottom: 7,
    },
    flexEndCol: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    stakeMoreBtn: {
        flexDirection: 'row',
        gap: 30,
        marginTop: 10,
    },
    unlockAssetView: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.grey7,
        borderRadius: 8,
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
    },
    subTitle: {
        marginTop: 22,
        marginBottom: 8,
        fontSize: 16,
        ...commonStyles.primaryFontFamily,
    },
    flexColEnd: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    fullWidthButton: {
        marginTop: 2,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockedCoinsAmount: {
        fontSize: 18,
        fontWeight: '700',
        ...commonStyles.secondaryFontFamily,
    },
    cryptoMsg: {
        fontSize: 16,
        fontWeight: '400',
        color: theme.colors.black,
    },
    cryptoEarned: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
    },
    apyPercentage: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.success,
        ...commonStyles.secondaryFontFamily,
    },
    leosMonthly: {
        fontSize: 13,
        color: theme.colors.grey9,
    },
    lockedUSDAmount: {
        fontSize: 15,
        fontWeight: '400',
        color: theme.colors.grey9,
    },
    allocationView: {
        backgroundColor: theme.colors.grey7,
        borderRadius: 12,
        paddingHorizontal: 13,
        paddingVertical: 7,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 11,
    },
    allocMulti: { color: theme.colors.grey9, fontWeight: '500' },

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
        color: theme.colors.success,
        marginTop: 6,
    },
});

export default StakeAssetDetailContainer;
