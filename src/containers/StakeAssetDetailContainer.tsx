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

            {selectedAllocation && <StakingAllocationDetails onClose={onClose} refMessage={refMessage} />}
            <TouchableOpacity style={styles.allocationView}>
                <Text style={{ fontWeight: '700' }}>6,000.00 LEOS</Text>
                <View style={styles.flexColEnd}>
                    <Text style={styles.allocMulti}>unlockable in 15 days</Text>
                    <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                </View>
            </TouchableOpacity>

            <Text style={styles.subTitle}>Unlockable</Text>

            <View style={styles.stakeView}>
                <View style={styles.row}>
                    <View style={styles.flexStartCol}>
                        <Text style={styles.lockedCoinsAmount}>{`69,023.35 LEOS`}</Text>
                        <Text style={styles.lockedUSDAmount}>{`= $3273.1`}</Text>
                    </View>
                </View>
                <View style={styles.stakeMoreBtn}>
                    <TButton
                        style={[
                            styles.unstakeBtn,
                            { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
                        ]}
                        onPress={() =>
                            navigation.navigate('UnStakeAsset', {
                                chain,
                            })
                        }
                        color={theme.colors.black}
                    >
                        Unstake
                    </TButton>
                </View>
            </View>

            <TouchableOpacity style={styles.allocationView}>
                <Text style={{ fontWeight: '700' }}>6,000.00 LEOS</Text>
                <View style={styles.flexColEnd}>
                    <Text style={styles.allocMulti}>released in 5 days</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.unlockAssetView}>
                <Text style={styles.unlockhead}>Why are my coins locked?</Text>

                <Text style={styles.lockedParagraph}>
                    These coins are locked during the staking period to support the network and earn rewards. Coins will
                    be fully unlockable in 30 days after they are staked
                </Text>
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
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.grey7,
        borderRadius: 8,
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        padding: 16,
    },
    subTitle: {
        marginTop: 20,
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
    unstakeBtn: {
        borderRadius: 6,
        backgroundColor: theme.colors.backgroundGray,
        width: '100%',
        paddingVertical: 15,
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
});

export default StakeAssetDetailContainer;
