import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from './TIconButton';
import theme from '../utils/theme';

export type Props = {
    refMessage: React.RefObject<any>;
    onClose: () => void;
};

const StakingAllocationDetails = (props: Props) => {
    return (
        <RBSheet
            ref={props.refMessage}
            openDuration={150}
            closeDuration={100}
            height={350}
            customStyles={{ container: { paddingHorizontal: 10 } }}
        >
            <View style={styles.vestHead}>
                <Text style={styles.drawerHead}>Staking details</Text>
                <TouchableOpacity onPress={props.onClose}>
                    <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} size={17} />
                </TouchableOpacity>
            </View>
            <View style={styles.vestingDetailView}>
                <View style={styles.allocationView}>
                    <Text style={styles.allocTitle}>Locked</Text>
                    <View style={styles.flexColCenter}>
                        <Text style={styles.allocMulti}>10,000.000 LEOS</Text>
                        <Text style={styles.usdBalance}>$2,338.05</Text>
                    </View>
                </View>
                <View style={styles.allocationView}>
                    <Text style={styles.allocTitle}>Annual Percentage Yield (APY)</Text>
                    <View style={styles.flexColEnd}>
                        <Text style={styles.allocMulti}>3.23% </Text>
                    </View>
                </View>
                <View style={[styles.allocationView, { marginTop: 25 }]}>
                    <Text style={styles.allocTitle}>Monthly earnings</Text>
                    <View style={styles.flexColCenter}>
                        <Text style={[styles.allocMulti, { color: theme.colors.success }]}>180.00 LEOS</Text>
                        <Text style={styles.usdBalance}>$50.05</Text>
                    </View>
                </View>
                <View style={styles.allocationView}>
                    <Text style={styles.allocTitle}>Stake until</Text>
                    <View style={styles.flexColEnd}>
                        <Text style={styles.allocMulti}>
                            15 Apr 2025 <Text style={{ color: theme.colors.grey9 }}>(30 days)</Text>
                        </Text>
                    </View>
                </View>
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
    allocTitle: { fontWeight: '500', color: theme.colors.grey9, fontSize: 14 },
    flexRowCenter: {
        flexDirection: 'row',
        gap: 7,
        alignItems: 'flex-end',
    },
});

export default StakingAllocationDetails;
