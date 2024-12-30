import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { StakeLesoscreenNavigationProp } from '../screens/StakeLeosScreen';
import theme, { commonStyles } from '../utils/theme';

import { IChain } from '../utils/chain/types';

import { TButtonContained } from '../components/atoms/TButton';

export type StakeLesoProps = {
    navigation: StakeLesoscreenNavigationProp['navigation'];
    chain: IChain;
};

const StakeLeosContainer = ({ navigation, chain }: StakeLesoProps) => {
    return (
        <>
            <View style={styles.container}>
                <View style={styles.flexCol}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter amount"
                            placeholderTextColor={theme.colors.tabGray}
                        />
                        <TouchableOpacity style={styles.inputButton}>
                            <Text style={styles.inputButtonText}>MAX</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.inputHelp}>Available: 10,000.00 LEOS</Text>
                </View>
                <View style={styles.annualView}>
                    <View style={styles.annualText}>
                        <Text style={styles.annualSubText}>Annual Percentage Yield (APY)</Text>
                        <Text style={styles.annualPercentage}>3.47%</Text>
                    </View>
                    <View style={styles.annualText}>
                        <Text style={styles.annualSubText}>Monthly earnings</Text>
                        <View>
                            <Text style={styles.annualPercentage}>180 LEOS</Text>
                            <Text style={styles.annualSubText}>$50.00</Text>
                        </View>
                    </View>
                    <View style={styles.annualText}>
                        <Text style={styles.annualSubText}>Stake until</Text>
                        <Text>
                            3 Nov 2024 <Text style={styles.annualSubText}>(30 days)</Text>
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.unlockAssetView}>
                <Text style={styles.unlockhead}>What is staking? </Text>
                <Text style={styles.lockedParagraph}>
                    Staking is locking up cryptocurrency to increase blockchain network security and earn rewards
                </Text>
            </View>
            <View style={styles.proceedBtn}>
                <TButtonContained>Proceed</TButtonContained>
            </View>
        </>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginTop: 10,
        gap: 24,
    },
    flexCol: {
        flexDirection: 'column',
        gap: 8,
    },
    unlockAssetView: {
        alignItems: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.grey7,
        marginVertical: 16,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    annualView: {
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: theme.colors.grey7,
        borderRadius: 6,
    },
    annualText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 12,
    },
    annualSubText: {
        fontSize: 14,
        color: theme.colors.grey9,
        textAlign: 'right',
    },
    annualPercentage: {
        fontWeight: '400',
        fontSize: 14,
        color: theme.colors.success,
    },
    unlockhead: {
        fontSize: 16,
        fontWeight: '700',
    },
    lockedParagraph: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.black,
        marginTop: 6,
    },
    inputContainer: {
        borderColor: theme.colors.grey8,
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    input: {
        height: 48,
        width: '100%',
        padding: 10,
        fontSize: 15,
        backgroundColor: theme.colors.white,
        flexShrink: 1,
    },
    inputButton: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginRight: 10,
        flexShrink: 0,
    },
    inputButtonText: {
        color: theme.colors.success,
        fontSize: 15,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    inputHelp: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.tabGray,
        ...commonStyles.secondaryFontFamily,
    },
    proceedBtn: {
        padding: 16,
    },
});

export default StakeLeosContainer;
