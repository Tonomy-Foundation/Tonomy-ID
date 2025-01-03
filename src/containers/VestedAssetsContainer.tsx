import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import { VestedAssetscreenNavigationProp } from '../screens/VestedAssetsScreen';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import { IChain } from '../utils/chain/types';

export type VestedAssetProps = {
    navigation: VestedAssetscreenNavigationProp['navigation'];
    chain: IChain;
};

const VestedAssetsContainer = ({ navigation, chain }: VestedAssetProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.subTitle}>Total vested assets</Text>
            <ImageBackground
                source={require('../assets/images/vesting/bg2.png')}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 10 }}
                resizeMode="stretch"
            >
                <Text style={styles.imageNetworkText}>Pangea Network</Text>
                <Text style={styles.imageText}>69,023.35 LEOS</Text>
                <Text style={styles.imageUsdText}>= $3273.1</Text>
            </ImageBackground>
            <Text style={styles.subTitle}>Unlockable coins</Text>

            <View style={styles.availableAssetView}>
                <View style={styles.header}>
                    <Text style={styles.headerAssetsAmount}>{`69,023.35 LEOS`}</Text>
                    <Text style={styles.headerUSDAmount}>{`= $3273.1`}</Text>

                    <View style={styles.sendReceiveButtons}>
                        <TButtonContained
                            style={styles.fullWidthButton}
                            onPress={() =>
                                navigation.navigate('VestedWithDrawSuccess', {
                                    chain: chain,
                                })
                            }
                        >
                            Withdraw
                        </TButtonContained>
                    </View>
                </View>
            </View>

            <Text style={styles.subTitle}>Locked coins</Text>

            <View style={styles.availableAssetView}>
                <View style={styles.header}>
                    <Text style={styles.lockedCoinsAmount}>{`69,023.35 LEOS`}</Text>
                    <Text style={styles.lockedUSDAmount}>{`= $3273.1`}</Text>

                    <View style={styles.sendReceiveButtons}>
                        <Text style={styles.lockedPercentage}>{`50% of your total assets`}</Text>
                    </View>
                </View>
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

    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 22,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 35,
        borderRadius: 10,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    headerAssetsAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1.4,
        ...commonStyles.secondaryFontFamily,
    },
    headerUSDAmount: {
        fontSize: 15,
        fontWeight: '400',
        color: theme.colors.grey9,
    },
    headerButton: {
        backgroundColor: theme.colors.backgroundGray,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    sendReceiveButtons: {
        flexDirection: 'row',
        gap: 30,
        marginTop: 10,
    },
    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    textSize: {
        fontSize: 12,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    availableAssetView: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        paddingVertical: 26,
        paddingHorizontal: 20,
    },
    subTitle: {
        marginTop: 20,
        marginBottom: 10,
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
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    imageBackground: {
        width: '100%',
        height: 170,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    imageText: {
        color: theme.colors.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    imageUsdText: {
        color: theme.colors.white,
        fontSize: 15,
        fontWeight: '500',
    },
    imageNetworkText: {
        color: theme.colors.white,
        fontSize: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 4,
        borderRadius: 5,
    },
    fullWidthButton: {
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockedCoinsAmount: {
        fontSize: 22,
        fontWeight: '500',
        ...commonStyles.secondaryFontFamily,
    },
    lockedUSDAmount: {
        fontSize: 15,
        fontWeight: '400',
        color: theme.colors.grey9,
    },
    lockedPercentage: {
        fontSize: 14,
        fontWeight: '400',
        color: theme.colors.grey9,
        marginTop: 8,
    },
});

export default VestedAssetsContainer;
