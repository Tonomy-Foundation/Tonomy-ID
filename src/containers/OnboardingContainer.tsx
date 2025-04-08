import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Swiper from 'react-native-swiper';
import { TButtonContained } from '../components/atoms/TButton';
import theme, { commonStyles } from '../utils/theme';
import ArrowForwardIcon from '../assets/icons/ArrowForwardIcon';
import { Props } from '../screens/OnboardingScreen';
import { StackActions } from '@react-navigation/native';
import { appStorage } from '../utils/StorageManager/setup';
import useErrorStore from '../store/errorStore';
import settings from '../settings';

const { height: screenHeight } = Dimensions.get('window');

const pictureAndSliderHeight = screenHeight * 0.69;
const textHeight = screenHeight * 0.22;
const buttonsHeight = screenHeight * 0.07;

function OnboardingContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const errorStore = useErrorStore();

    const slides = [
        {
            id: 1,
            title: `Welcome to the Virtual Nation of ${settings.config.ecosystemName}`,
            text: `${settings.config.appName} is your access point to a brand new world.`,
            image: require('../assets/images/onboarding/1.png'),
        },
        {
            id: 2,
            title: `Passwordless login to ${settings.config.ecosystemName} apps`,
            text: `No more passwords for every app you use! Using the secure login of ${settings.config.ecosystemName}.`,
            image: require('../assets/images/onboarding/2.png'),
        },
        {
            id: 3,
            title: 'You control your data and citizenship',
            text: `Your data is stored on your phone. ${settings.config.ecosystemName} and third parties can’t access it.`,
            image: require('../assets/images/onboarding/3.png'),
        },
        {
            id: 4,
            title: 'Manage your crypto assets with ease',
            text: 'So easy it’s obvious. No technical knowledge required.',
            image: require('../assets/images/onboarding/4.png'),
        },
        {
            id: 5,
            title: 'Web4 trust-less platform for people',
            text: 'We give citizens full control, powered by invisible Web4 technology!',
            image: require('../assets/images/onboarding/5.png'),
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
                    <TButtonContained size="large" style={{ width: '100%' }} onPress={onFinish}>
                        PROCEED
                    </TButtonContained>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pictureAndSlider: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '90%',
        height: '85%',
        resizeMode: 'contain',
    },
    dot: {
        backgroundColor: 'rgba(0,0,0,.24)',
        width: 14,
        height: 5,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: theme.colors.black,
        width: 14,
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
        gap: 10,
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: 13,
        paddingBottom: 5,
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        lineHeight: 32,
        ...commonStyles.primaryFontFamily,
    },
    text: {
        fontSize: 16,
        lineHeight: 21,
        ...commonStyles.secondaryFontFamily,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        width: '100%',
        minHeight: 55,
    },
    skipButton: {
        fontSize: 16,
    },
    nextButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: 40,
    },
});

export default OnboardingContainer;
