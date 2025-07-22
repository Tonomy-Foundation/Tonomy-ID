import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Swiper from 'react-native-swiper';
import { TButtonContained } from '../components/atoms/TButton';
import theme, { commonStyles } from '../utils/theme';
import ArrowForwardIcon from '../assets/icons/ArrowForwardIcon';
import { Props } from '../screens/KycOnboardingScreen';
import { StackActions } from '@react-navigation/native';
import { appStorage } from '../utils/StorageManager/setup';
import useErrorStore from '../store/errorStore';
import OnBoardingImage1 from '../assets/images/kyc-onboarding/1.png';
import OnBoardingImage2 from '../assets/images/kyc-onboarding/2.png';
import OnBoardingImage3 from '../assets/images/kyc-onboarding/3.png';
import OnBoardingImage4 from '../assets/images/kyc-onboarding/4.png';
import BackgroundSvg from '../assets/images/kyc-onboarding/bg.svg';

const { height: screenHeight } = Dimensions.get('window');

const pictureAndSliderHeight = screenHeight * 0.59;
const textHeight = screenHeight * 0.22;
const buttonsHeight = screenHeight * 0.09;

function KycOnboardingContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const errorStore = useErrorStore();

    const slides = [
        {
            id: 1,
            title: `Tired of verifying your identity again and again?`,
            text: '',
            image: OnBoardingImage1,
        },
        {
            id: 2,
            title: `Meet reusable KYC`,
            text: `Verify once. Log in anywhere securely — without repeating the process`,
            image: OnBoardingImage2,
        },
        {
            id: 3,
            title: 'Faster access. Full control',
            text: `Your data stays private and secure — even we can’t see it`,
            image: OnBoardingImage3,
        },
        {
            id: 4,
            title: 'One ID. All your apps',
            text: 'This is just the beginning',
            image: OnBoardingImage4,
        },
    ];

    const onFinish = async () => {
        try {
            await appStorage.setSplashOnboarding(false);
            navigation.dispatch(StackActions.replace('Home'));
        } catch (error) {
            errorStore.setError({ error, expected: false });
        }
    };

    const onNext = () => {
        if (activeIndex === slides.length - 1) {
            onFinish();
        } else {
            setActiveIndex(activeIndex + 1);
        }
    };

    return (
        <View style={styles.container}>
            <BackgroundSvg
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.pictureAndSlider, { height: pictureAndSliderHeight }]}>
                <Swiper
                    loop={false}
                    index={activeIndex}
                    onIndexChanged={(index) => setActiveIndex(index)}
                    showsPagination={true}
                    dotStyle={styles.dot}
                    activeDotStyle={styles.activeDot}
                >
                    {slides.map((slide) => (
                        <View style={styles.slide} key={slide.id}>
                            <Image source={slide.image} style={styles.image} />
                        </View>
                    ))}
                </Swiper>
            </View>

            <View style={[styles.textContainer, { height: textHeight }]}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.title}>{slides[activeIndex].title}</Text>
                    <Text style={styles.text}>{slides[activeIndex].text}</Text>
                </ScrollView>
            </View>

            <View style={[styles.buttonContainer, { height: buttonsHeight }]}>
                {activeIndex < slides.length - 1 && (
                    <TouchableOpacity onPress={onFinish}>
                        <Text style={styles.skipButton}>Skip</Text>
                    </TouchableOpacity>
                )}
                {activeIndex < slides.length - 1 && (
                    <TouchableOpacity onPress={onNext} style={styles.nextButton}>
                        <ArrowForwardIcon color={theme.colors.white} />
                    </TouchableOpacity>
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
    container: {
        flex: 1,
    },
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
        paddingHorizontal: 18,
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
        borderColor: theme.colors.white,
    },
});

export default KycOnboardingContainer;
