import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { VestedAssetscreenNavigationProp } from '../screens/VestedAssetsScreen';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/TButton';
import { NavArrowRight } from 'iconoir-react-native';
import AllocationDetails from '../components/AllocationDetails';
import { IChain, VestedTokens, VestedAllocation } from '../utils/chain/types';
import { getAccountFromChain, getTokenEntryByChain } from '../utils/tokenRegistry';
import TSpinner from '../components/atoms/TSpinner';
import { formatCurrencyValue, formatTokenValue } from '../utils/numbers';
import Decimal from 'decimal.js';
import useUserStore from '../store/userStore';
import useErrorStore from '../store/errorStore';
import settings from '../settings';
import { getVestingContract } from '@tonomy/tonomy-id-sdk';

export type VestedAssetProps = {
    navigation: VestedAssetscreenNavigationProp['navigation'];
    chain: IChain;
};

const VestedAssetsContainer = ({ navigation, chain }: VestedAssetProps) => {
    const [loading, setLoading] = useState(true);
    const [usdPrice, setUsdPrice] = useState(0);
    const [vestedAllocations, setVestedAllocation] = useState<VestedTokens>({} as VestedTokens);
    const [selectedAllocation, setSelectedAllocation] = useState<VestedAllocation>({} as VestedAllocation);
    const [launchDate, setLaunchDate] = useState<Date | null>(null);
    const refMessage = useRef<{ open: () => void; close: () => void }>(null);
    const token = chain.getNativeToken();
    const { user } = useUserStore();
    const errorStore = useErrorStore();

    const onClose = () => {
        refMessage.current?.close();
    };

    useEffect(() => {
        const fetchVestedAllocation = async () => {
            try {
                const tokenEntry = await getTokenEntryByChain(chain);

                const account = await getAccountFromChain(tokenEntry, user);

                const allocations = await token.getVestedTokens(account);
                const usdPriceValue = await chain.getNativeToken().getUsdPrice();

                setUsdPrice(usdPriceValue);
                setVestedAllocation(allocations);
                const launchDate = (await getVestingContract().getSettings()).launchDate;

                setLaunchDate(launchDate);
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            } finally {
                setLoading(false);
            }
        };

        fetchVestedAllocation();
        const interval = setInterval(fetchVestedAllocation, 10000);

        return () => clearInterval(interval);
    }, [chain, token, user, errorStore]);

    if (loading) {
        return (
            <View style={styles.textContainer}>
                <TSpinner />
            </View>
        );
    }

    const totalVestedView = () => {
        const totalVestedAmount = vestedAllocations.locked;
        const totalVestedAmountUsd = totalVestedAmount * usdPrice;

        return (
            <View>
                <Text style={styles.subTitle}>Total vested assets</Text>
                <ImageBackground
                    source={require('../assets/images/vesting/bg2.png')}
                    style={styles.imageBackground}
                    imageStyle={{ borderRadius: 10 }}
                    resizeMode="stretch"
                >
                    <Text style={styles.imageNetworkText}>{settings.config.ecosystemName} Network</Text>
                    <Text style={styles.imageText}>
                        {totalVestedAmount && formatTokenValue(new Decimal(totalVestedAmount))}{' '}
                        {chain.getNativeToken().getSymbol()}
                    </Text>
                    <Text style={styles.imageUsdText}>= ${formatCurrencyValue(totalVestedAmountUsd)}</Text>
                </ImageBackground>
            </View>
        );
    };

    const withDrawVested = async () => {
        navigation.navigate('WithdrawVested', {
            chain,
            amount: vestedAllocations.unlockable,
            total: vestedAllocations.locked,
        });
    };

    const vestingAllocationsView = () => {
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
                <View style={{ marginVertical: 16 }}>
                    {vestedAllocations?.allocationsDetails?.length > 0 &&
                        vestedAllocations.allocationsDetails.map((allocation, index) => (
                            <View key={index}>
                                {allocation.totalAllocation !== allocation.unlocked && (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.allocationView}
                                        onPress={() => {
                                            setSelectedAllocation(allocation);
                                            refMessage.current?.open();
                                        }}
                                    >
                                        <Text style={{ fontWeight: '500' }}>
                                            {formatTokenValue(new Decimal(allocation.locked))}{' '}
                                            {chain.getNativeToken().getSymbol()}
                                        </Text>
                                        <View style={styles.flexColEnd}>
                                            <NavArrowRight
                                                height={15}
                                                width={15}
                                                color={theme.colors.grey2}
                                                strokeWidth={2}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                    {selectedAllocation && (
                        <AllocationDetails
                            onClose={onClose}
                            refMessage={refMessage}
                            allocationData={selectedAllocation}
                            usdPriceValue={usdPrice}
                            initialUnlockDate={launchDate}
                        />
                    )}
                </View>
                {vestedAllocations.unlockable > 0 && (
                    <View>
                        <Text style={styles.subTitle}>Unlockable coins</Text>

                        <View style={styles.availableAssetView}>
                            <View style={styles.header}>
                                <Text style={styles.lockedCoinsAmount}>
                                    {formatTokenValue(new Decimal(vestedAllocations.unlockable ?? 0))}{' '}
                                    {settings.config.currencySymbol}
                                </Text>
                                <Text style={styles.lockedUSDAmount}>
                                    ${formatCurrencyValue(vestedAllocations.unlockable * usdPrice)}
                                </Text>
                                <View style={styles.sendReceiveButtons}>
                                    <TButtonContained style={styles.fullWidthButton} onPress={() => withDrawVested()}>
                                        Withdraw
                                    </TButtonContained>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
                <View style={styles.unlockAssetView}>
                    <Text style={styles.unlockhead}>When can I unlock coins?</Text>

                    <Text style={styles.lockedParagraph}>
                        Coins are gradually unlockable after the public sale based on the vesting schedule for your
                        allocation(s).
                    </Text>
                </View>
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            {totalVestedView()}
            {vestingAllocationsView()}
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
        paddingVertical: 25,
        paddingHorizontal: 25,
    },
    unlockAssetView: {
        alignItems: 'flex-start',
        backgroundColor: theme.colors.grey7,
        borderRadius: 8,
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        gap: 8,
        padding: 16,
    },
    subTitle: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: 'bold',
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
        fontWeight: '800',
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
    },
    unlockhead: {
        fontSize: 16,
        fontWeight: '700',
        alignItems: 'flex-start',
    },
    allocationView: {
        backgroundColor: theme.colors.grey7,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    allocMulti: { color: theme.colors.grey9, fontWeight: '500' },
    scrollView: { minHeight: 270, maxHeight: 470, paddingTop: 5, marginBottom: 10 },
});

export default VestedAssetsContainer;
