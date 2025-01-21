import { StyleSheet, Text, View, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { VestedAssetscreenNavigationProp } from '../screens/VestedAssetsScreen';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import { NavArrowRight } from 'iconoir-react-native';
import { useEffect, useRef, useState } from 'react';
import AllocationDetails from '../components/AllocationDetails';
import { IChain, VestedTokens, VestedAllocation } from '../utils/chain/types';
import { getAccountFromChain, getTokenEntryByChain } from '../utils/tokenRegistry';
import TSpinner from '../components/atoms/TSpinner';
import { formatCurrencyValue, formatTokenValue } from '../utils/numbers';
import { getMultiplier } from '../utils/multiplier';
import Decimal from 'decimal.js';
import useUserStore from '../store/userStore';

export type VestedAssetProps = {
    navigation: VestedAssetscreenNavigationProp['navigation'];
    chain: IChain;
};

const VestedAssetsContainer = ({ navigation, chain }: VestedAssetProps) => {
    const [loading, setLoading] = useState(true);
    const [usdPrice, setUsdPrice] = useState(0);
    const [vestedAllocations, setVestedAllocation] = useState<VestedTokens>({} as VestedTokens);
    const [selectedAllocation, setSelectedAllocation] = useState<VestedAllocation>({} as VestedAllocation);

    const refMessage = useRef<{ open: () => void; close: () => void }>(null);
    const token = chain.getNativeToken();
    const { user } = useUserStore();

    const onClose = () => {
        refMessage.current?.close();
    };

    useEffect(() => {
        const fetchVestedAllocation = async () => {
            const tokenEntry = await getTokenEntryByChain(chain);

            const account = await getAccountFromChain(tokenEntry, user);
            const allocations = await token.getVestedTokens(account);
            const usdPriceValue = await chain.getNativeToken().getUsdPrice();

            console.log('usdPriceValue', usdPriceValue);
            setUsdPrice(usdPriceValue);
            setVestedAllocation(allocations);
            setLoading(false);
        };

        fetchVestedAllocation();
    }, [chain, token, user]);

    const calculateAverageMultiplier = (vestingData: VestedTokens): number => {
        const { allocationsDetails } = vestingData;

        let totalWeightedMultiplier = 0;
        let totalLockedAndUnlockable = 0;

        allocationsDetails.forEach((allocation) => {
            const { locked, unlockable } = allocation;
            const multiplier = getMultiplier(allocation.allocationDate, allocation.categoryId);

            if (multiplier) {
                const lockedPlusUnlockable = locked + unlockable;

                totalWeightedMultiplier += multiplier * lockedPlusUnlockable;
                totalLockedAndUnlockable += lockedPlusUnlockable;
            }
        });

        // Calculate average multiplier
        return totalLockedAndUnlockable > 0 ? totalWeightedMultiplier / totalLockedAndUnlockable : 0;
    };

    if (loading) {
        return (
            <View style={styles.textContainer}>
                <TSpinner />
            </View>
        );
    }

    const totalVestedView = () => {
        const totalVestedAmount = vestedAllocations.locked + vestedAllocations.unlockable;

        const totalVestedAmountUsd = totalVestedAmount * usdPrice;
        const averageMultiplier = calculateAverageMultiplier(vestedAllocations);

        return (
            <View>
                <Text style={styles.subTitle}>Total vested assets</Text>
                <ImageBackground
                    source={require('../assets/images/vesting/bg2.png')}
                    style={styles.imageBackground}
                    imageStyle={{ borderRadius: 10 }}
                    resizeMode="stretch"
                >
                    <Text style={styles.imageNetworkText}>Pangea Network</Text>
                    <Text style={styles.imageText}>
                        {formatTokenValue(new Decimal(totalVestedAmount))} {chain.getNativeToken().getSymbol()}
                    </Text>
                    <Text style={styles.imageUsdText}>= ${formatCurrencyValue(totalVestedAmountUsd)}</Text>
                    <Text style={styles.averageMultiplier}>Average multiplier: x{averageMultiplier}</Text>
                </ImageBackground>
            </View>
        );
    };

    const vestingAllocationsView = () => {
        return (
            <ScrollView>
                <View style={{ marginTop: 12 }}>
                    {vestedAllocations.allocationsDetails.map((allocation, index) => (
                        <View key={index}>
                            <TouchableOpacity
                                key={index}
                                style={styles.allocationView}
                                onPress={() => {
                                    setSelectedAllocation(allocation);
                                    refMessage.current?.open();
                                }}
                            >
                                <Text style={{ fontWeight: '700' }}>
                                    {formatTokenValue(new Decimal(allocation.totalAllocation))}{' '}
                                    {chain.getNativeToken().getSymbol()}
                                </Text>
                                <View style={styles.flexColEnd}>
                                    <Text style={styles.allocMulti}>
                                        Multiplier:
                                        <Text style={{ color: theme.colors.success }}>
                                            x{getMultiplier(allocation.allocationDate, allocation.categoryId)}
                                        </Text>
                                    </Text>
                                    <NavArrowRight height={15} width={15} color={theme.colors.grey2} strokeWidth={2} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    ))}
                    {selectedAllocation && (
                        <AllocationDetails
                            onClose={onClose}
                            refMessage={refMessage}
                            allocationData={selectedAllocation}
                            usdPriceValue={usdPrice}
                        />
                    )}
                </View>
                {vestedAllocations.unlockable > 0 && (
                    <View>
                        <Text style={styles.subTitle}>Unlockable coins</Text>

                        <View style={styles.availableAssetView}>
                            <View style={styles.header}>
                                <Text style={styles.lockedCoinsAmount}>
                                    {formatTokenValue(new Decimal(vestedAllocations.unlockable ?? 0))}
                                </Text>
                                <Text style={styles.lockedUSDAmount}>
                                    {formatCurrencyValue(vestedAllocations.unlockable * usdPrice)}
                                </Text>
                                <View style={styles.sendReceiveButtons}>
                                    <TButtonContained style={styles.fullWidthButton}>Withdraw</TButtonContained>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            {totalVestedView()}
            {vestingAllocationsView()}

            <View style={styles.unlockAssetView}>
                <Text style={styles.unlockhead}>When can I unlock coins?</Text>

                <Text style={styles.lockedParagraph}>
                    Coins are gradually unlockable after the public sale based on the vesting schedule for your
                    allocation(s).
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
        borderRadius: 8,
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
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
