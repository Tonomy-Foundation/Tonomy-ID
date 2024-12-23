import { StyleSheet, Text, View, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { VestedAssetscreenNavigationProp } from '../screens/VestedAssetsScreen';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import { NavArrowRight } from 'iconoir-react-native';
import { useRef, useState } from 'react';
import AllocationDetails from '../components/AllocationDetails';

export type VestedAssetProps = {
    navigation: VestedAssetscreenNavigationProp['navigation'];
};

const VestedAssetsContainer = ({ navigation }: VestedAssetProps) => {
    const refMessage = useRef<{ open: () => void; close: () => void }>(null);
    const onClose = () => {
        refMessage.current?.close();
    };

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
                <Text style={styles.averageMultiplier}>Average multiplier: x4.5</Text>
            </ImageBackground>
            <ScrollView>
                <View style={{ marginTop: 12 }}>
                    <TouchableOpacity style={styles.allocationView} onPress={() => refMessage.current?.open()}>
                        <Text style={{ fontWeight: '700' }}>3,000.00 LEOS</Text>
                        <View style={styles.flexColEnd}>
                            <Text style={styles.allocMulti}>
                                Multiplier: <Text style={{ color: theme.colors.success }}>x3</Text>
                            </Text>
                            <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.allocationView}>
                        <Text style={{ fontWeight: '700' }}>3,000.00 LEOS</Text>
                        <View style={styles.flexColEnd}>
                            <Text style={styles.allocMulti}>
                                Multiplier: <Text style={{ color: theme.colors.success }}>x3</Text>
                            </Text>
                            <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                        </View>
                    </View>
                </View>
                {/* Uncomment when implementing withdraw  */}

                {/* <Text style={styles.subTitle}>Unlockable coins</Text>

                <View style={styles.availableAssetView}>
                    <View style={styles.header}>
                        <Text style={styles.lockedCoinsAmount}>{`69,023.35 LEOS`}</Text>
                        <Text style={styles.lockedUSDAmount}>{`= $3273.1`}</Text>
                        <View style={styles.sendReceiveButtons}>
                            <TButtonContained style={styles.fullWidthButton}>Withdraw</TButtonContained>
                        </View>
                    </View>
                </View> */}
            </ScrollView>
            <View style={styles.unlockAssetView}>
                <Text style={styles.unlockhead}>When can I unlock coins?</Text>

                <Text style={styles.lockedParagraph}>
                    Coins are gradually unlockable after the public sale based on the vesting schedule for your
                    allocation(s).
                </Text>
            </View>
            <AllocationDetails onClose={onClose} refMessage={refMessage} />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginTop: 10,
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
    lockedParagraph: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.black,
        marginTop: 6,
    },
    unlockhead: {
        fontSize: 16,
        fontWeight: '700',
        alignItems: 'flex-start',
    },
    averageMultiplier: {
        backgroundColor: theme.colors.success,
        color: theme.colors.white,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 5,
        marginTop: 12,
        fontSize: 13,
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

export default VestedAssetsContainer;
