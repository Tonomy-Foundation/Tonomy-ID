/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Swiper from 'react-native-swiper';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import theme, { commonStyles } from '../utils/theme';
import ArrowForwardIcon from '../assets/icons/ArrowForwardIcon';
import { Props } from '../screens/KycOnboardingScreen';
import useErrorStore from '../store/errorStore';
import OnBoardingImage1 from '../assets/images/kyc-onboarding/1.png';
import OnBoardingImage2 from '../assets/images/kyc-onboarding/2.png';
import OnBoardingImage3 from '../assets/images/kyc-onboarding/3.png';
import OnBoardingImage4 from '../assets/images/kyc-onboarding/4.png';
import BackgroundSvg from '../assets/images/kyc-onboarding/bg.svg';
import { Bubble } from '../components/Bubble';

const { height: screenHeight } = Dimensions.get('window');
const pictureAndSliderHeight = screenHeight * 0.59;
const textHeight = screenHeight * 0.22;
const buttonsHeight = screenHeight * 0.09;

function KycOnboardingContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const errorStore = useErrorStore();
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const slides = [
        {
            id: 1,
            title: `Tired of verifying your identity again and again?`,
            text: '',
            image: OnBoardingImage1,
            bubbles: [
                { top: -0.27, left: 0.23, text: 'Frustration', delay: 300, side: 'right' },
                { top: -0.22, left: -0.43, text: '💢', delay: 400, side: 'left' },
                { top: -0.004, left: 0.35, text: '😤', delay: 500, side: 'right' },
            ],
        },
        {
            id: 2,
            title: `Meet reusable KYC`,
            text: `Verify once. Log in anywhere securely — without repeating the process`,
            image: OnBoardingImage2,
            bubbles: [
                { top: -0.29, left: 0.11, text: 'Already verified?', delay: 300, side: 'right' },
                { top: -0.22, left: -0.44, text: '😍', delay: 400, side: 'left' },
                { top: -0.02, left: -0.44, text: 'Felt kind of magic', delay: 500, side: 'left' },
            ],
        },
        {
            id: 3,
            title: 'Faster access. Full control',
            text: `Your data stays private and secure — even we can't see it`,
            image: OnBoardingImage3,
            bubbles: [
                { top: -0.29, left: -0.44, text: 'Privacy', delay: 300, side: 'left' },
                { top: -0.2, left: 0.34, text: '😎', delay: 400, side: 'right' },
                { top: 0.0, left: 0.19, text: 'Confidence', delay: 500, side: 'right' },
            ],
        },
        {
            id: 4,
            title: 'One ID. All your apps',
            text: 'This is just the beginning',
            image: OnBoardingImage4,
            bubbles: [
                { top: -0.27, left: -0.44, text: '👍', delay: 300, side: 'left' },
                { top: -0.13, left: 0.13, text: 'No forms? Nice', delay: 400, side: 'right' },
                { top: 0.0, left: -0.45, text: 'That was fast', delay: 500, side: 'left' },
            ],
        },
    ];
    // Animation values for slide transitions
    const screenOpacity = useSharedValue(1);
    const screenScale = useSharedValue(1);

    const onFinish = async () => {
        try {
            // Exit animation for final slide
            screenOpacity.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) });
            screenScale.value = withTiming(0.96, { duration: 300, easing: Easing.inOut(Easing.ease) });

            // Wait for animation to complete
            await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error) {
            errorStore.setError({ error, expected: false });
        }
    };

    const onNext = async () => {
        if (activeIndex === slides.length - 1) {
            onFinish();
        } else {
            const next = activeIndex + 1;

            setActiveIndex(next);
        }
    };

    const screenStyle = useAnimatedStyle(() => ({
        opacity: screenOpacity.value,
        transform: [{ scale: screenScale.value }],
    }));

    return (
        <View style={[styles.container]}>
            <BackgroundSvg
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                style={StyleSheet.absoluteFill}
            />

            <Animated.View style={[styles.pictureAndSlider, { height: pictureAndSliderHeight }, screenStyle]}>
                <Swiper
                    loop={false}
                    index={activeIndex}
                    onIndexChanged={(index) => setActiveIndex(index)}
                    showsPagination={true}
                    dotStyle={styles.dot}
                    activeDotStyle={styles.activeDot}
                >
                    {slides.map((slide) => {
                        return (
                            <View style={styles.slide} key={slide.id}>
                                <Image source={slide.image} style={[styles.image]} />
                                <View style={[styles.bubblesContainer]}>
                                    {slide.bubbles.map((b, i) => {
                                        const top = b.top * screenHeight;
                                        const left = b.left * screenWidth;

                                        return (
                                            <View key={i} style={{ position: 'absolute', top, left }}>
                                                <Bubble text={b.text} delay={b.delay} side={b.side} />
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })}
                </Swiper>
            </Animated.View>

            <View style={[styles.textContainer, { height: textHeight }]}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.title}>{slides[activeIndex].title}</Text>
                    <Text style={styles.text}>{slides[activeIndex].text}</Text>
                </ScrollView>
            </View>

            <View style={[styles.buttonContainer, { height: buttonsHeight }]}>
                {activeIndex < slides.length - 1 && (
                    <>
                        <TouchableOpacity onPress={onFinish}>
                            <Text style={styles.skipButton}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onNext} style={styles.nextButton}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: theme.colors.white, marginRight: 5, fontSize: 16 }}>Next</Text>
                                <ArrowForwardIcon color={theme.colors.white} />
                            </View>
                        </TouchableOpacity>
                    </>
                )}
                {activeIndex === slides.length - 1 && (
                    <TouchableOpacity style={styles.getStartedBtn} onPress={onFinish}>
                        <Text style={{ color: theme.colors.white }}>Get Started!</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    pictureAndSlider: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '80%',
        height: '75%',
        resizeMode: 'contain',
    },
    dot: {
        backgroundColor: theme.colors.white,
        width: 6,
        height: 5,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: theme.colors.white,
        width: 18,
        height: 5,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 10,
        paddingHorizontal: 6,
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
        fontSize: 26,
        fontWeight: 'bold',
        lineHeight: 32,
        color: theme.colors.white,
        ...commonStyles.primaryFontFamily,
    },
    text: {
        fontSize: 16,
        lineHeight: 21,
        color: theme.colors.white,
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
    },
    skipButton: {
        fontSize: 16,
        color: theme.colors.white,
    },
    nextButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
    },
    getStartedBtn: {
        width: '100%',
        backgroundColor: theme.colors.black,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#BA54D3',
    },
    bubblesContainer: {
        position: 'absolute',
        bottom: screenHeight * 0.2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
});

export default KycOnboardingContainer;
