import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Linking, Image } from 'react-native';
import { Props } from '../screens/StakeLeosDetailScreen';
import { IChain } from '../utils/chain/types';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';

export type StakingLeosProps = {
    navigation: Props['navigation'];
    chain: IChain;
};

const StakeLeosDetailContainer = ({ navigation, chain }: StakingLeosProps) => {
    return (
        <View style={styles.availableAssetView}>
            <View style={styles.row}>
                <View style={styles.flexStartCol}>
                    <Text style={styles.lockedCoinsAmount}>{`69,023.35 LEOS`}</Text>
                    <Text style={styles.lockedUSDAmount}>{`= $3273.1`}</Text>
                </View>
                <View style={styles.flexEndCol}>
                    <Text style={styles.lockedCoinsAmount}>3.48% APY</Text>
                    <Text style={styles.lockedUSDAmount}>{`= $3273.1`}</Text>
                </View>
            </View>
            <View style={styles.stakeMoreBtn}>
                <TButtonContained style={styles.fullWidthButton}>Stake more</TButtonContained>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    flexStartCol: {
        flexDirection: 'column',
        alignItems: 'flex-start',
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
    availableAssetView: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        paddingVertical: 20,
        paddingHorizontal: 18,
    },
    unlockAssetView: {
        alignItems: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: theme.colors.grey7,
        marginVertical: 60,
        borderRadius: 8,
    },
    subTitle: {
        marginBottom: 8,
        fontSize: 16,
        ...commonStyles.primaryFontFamily,
    },
    moreView: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        paddingHorizontal: 13,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
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
        fontSize: 21,
        fontWeight: '700',
        ...commonStyles.secondaryFontFamily,
    },
    lockedUSDAmount: {
        fontSize: 16,
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
});

export default StakeLeosDetailContainer;
