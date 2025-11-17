/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Swiper from 'react-native-swiper';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import theme, { commonStyles } from '../utils/theme';
import ArrowForwardIcon from '../assets/icons/ArrowForwardIcon';
import { Props } from '../screens/KycOnboardingScreen';
import useErrorStore from '../store/errorStore';
import OnBoardingImage1 from '../assets/images/kyc-onboarding/1.png';
import OnBoardingImage2 from '../assets/images/kyc-onboarding/2.png';
import OnBoardingImage3 from '../assets/images/kyc-onboarding/3.png';
import { handleVeriffIfRequired } from '../utils/veriff';
import { KYCPayload, KYCVC, SdkErrors, util, VeriffStatusEnum, VerificationTypeEnum } from '@tonomy/tonomy-id-sdk';
import settings from '../settings';
import useUserStore from '../store/userStore';
import TSpinner from '../components/atoms/TSpinner';

type VeriffPayload = {
    appName: string;
    proof?: string;
};

function KycOnboardingContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const errorStore = useErrorStore();
    const { user } = useUserStore();

    const slides = [
        {
            id: 1,
            title: `Tired of verifying your identity again and again?`,
            text: 'Skip the forms and endless uploads — verify once, use everywhere',
            image: OnBoardingImage1,
        },
        {
            id: 2,
            title: `Skip new verifications – meet reusable KYC`,
            text: `Verify once. Log in anywhere securely – without repeating the process`,
            image: OnBoardingImage2,
        },
        {
            id: 3,
            title: 'One ID. All your apps',
            text: `Keep your data private and use it anywhere you log in`,
            image: OnBoardingImage3,
        },
    ];
    // Animation values for slide transitions
    const screenOpacity = useSharedValue(1);
    const screenScale = useSharedValue(1);

    async function startVeriffFlow() {
        const appName = settings.config.appName;

        const issuer = await user.getIssuer();
        const did = await user.getDid();

        const proofVc = await util.VerifiableCredential.sign<VeriffPayload>(
            did,
            'VerifiableCredential',
            { appName },
            issuer
        );

        const jwt = proofVc.toString();
        const verificationEventPromise: Promise<KYCPayload> = user.waitForNextVeriffVerification();

        try {
            const isVerified = await handleVeriffIfRequired(jwt, navigation);

            setActiveIndex(0);

            setLoading(true);

            // Verification was successful from user
            if (isVerified) {
                let verificationEvent: KYCPayload;

                try {
                    verificationEvent = await verificationEventPromise;
                    navigation.navigate('VeriffDataSharing', { payload: verificationEvent });
                } catch (error) {
                    if (error.code === SdkErrors.VerificationDataNotFound) {
                        verificationEvent = (
                            (await user.fetchVerificationData(
                                VerificationTypeEnum.KYC,
                                VeriffStatusEnum.APPROVED
                            )) as KYCVC
                        ).getPayload();
                        navigation.navigate('VeriffDataSharing', { payload: verificationEvent });
                    } else {
                        errorStore.setError({ error: error, expected: false });
                    }
                }
            } else {
                // show error message
                errorStore.setError({
                    error: new Error('Verification failed. Please try again later.'),
                    expected: false,
                });
                navigation.navigate('VeriffLogin');
            }
        } catch (error) {
            console.error('Error during Veriff flow:', error);
            errorStore.setError({ error, expected: false });
            navigation.navigate('VeriffLogin');
        } finally {
            setLoading(false);
        }
    }

    const onFinish = async () => {
        startVeriffFlow();
    };

    const onNext = async () => {
        if (activeIndex === slides.length - 1) {
            onFinish();
            return;
        }

        setActiveIndex((prev) => prev + 1);
    };

    const screenStyle = useAnimatedStyle(() => ({
        opacity: screenOpacity.value,
        transform: [{ scale: screenScale.value }],
    }));

    return (
        <>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <View style={styles.inner}>
                        <TSpinner size={80} />
                        <Text style={styles.loadingtitle}>Verifying your identity</Text>
                        <Text style={styles.subtitle}>This may take a few moments</Text>
                    </View>
                </View>
            ) : (
                <View style={[styles.container]}>
                    <Swiper
                        loop={false}
                        index={activeIndex}
                        onIndexChanged={(index) => setActiveIndex(index)}
                        showsPagination={true}
                        dotStyle={styles.dot}
                        activeDotStyle={styles.activeDot}
                        paginationStyle={{ bottom: 230 }}
                    >
                        {slides.map((slide) => {
                            return (
                                <View style={styles.slide} key={slide.id}>
                                    <Image source={slide.image} style={[styles.image]} />
                                </View>
                            );
                        })}
                    </Swiper>

                    <View style={[styles.textContainer]}>
                        <ScrollView contentContainerStyle={styles.content}>
                            <Text style={styles.title}>{slides[activeIndex]?.title}</Text>
                            <Text style={styles.text}>{slides[activeIndex]?.text}</Text>
                        </ScrollView>
                    </View>

                    <View style={[styles.buttonContainer]}>
                        {activeIndex < slides.length - 1 && (
                            <>
                                <TouchableOpacity onPress={onFinish}>
                                    <Text style={styles.skipButton}>Skip</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onNext} style={styles.nextButton}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ color: theme.colors.black, marginRight: 5, fontSize: 16 }}>
                                            Next
                                        </Text>
                                        <ArrowForwardIcon color={theme.colors.black} />
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}
                        {activeIndex === slides.length - 1 && (
                            <TouchableOpacity style={styles.getStartedBtn} onPress={() => startVeriffFlow()}>
                                <Text style={{ color: theme.colors.white }}>Get Started!</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, display: 'flex' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 110,
    },
    pictureAndSlider: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 80,
    },

    image: {
        width: '90%',
        height: '85%', // slightly taller image to fill space
        resizeMode: 'contain',
        marginBottom: 5, // smaller bottom space
        bottom: 70,
    },

    dot: {
        backgroundColor: theme.colors.primary,
        width: 6,
        height: 5,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: theme.colors.primary,
        width: 18,
        height: 5,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        bottom: 190,
    },
    content: {
        gap: 9,
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: 13,
        paddingBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 29,
        fontWeight: 'bold',
        lineHeight: 32,
        color: theme.colors.black,
        textAlign: 'center',
        ...commonStyles.primaryFontFamily,
    },
    text: {
        fontSize: 18,
        lineHeight: 21,
        color: theme.colors.black,
        textAlign: 'center',
        ...commonStyles.secondaryFontFamily,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        width: '100%',
        minHeight: 55,
        bottom: 60,
    },
    skipButton: {
        fontSize: 16,
        color: theme.colors.black,
    },
    nextButton: {
        width: 70,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
    },
    getStartedBtn: {
        width: '100%',
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#BA54D3',
    },

    inner: {
        alignItems: 'center',
    },
    loadingtitle: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: -15,
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 8,
    },
});

export default KycOnboardingContainer;
