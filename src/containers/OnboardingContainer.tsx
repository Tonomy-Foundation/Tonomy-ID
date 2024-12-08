import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { TButtonContained } from '../components/atoms/TButton';
import theme, { commonStyles } from '../utils/theme';
import ArrowForwardIcon from '../assets/icons/ArrowForwardIcon';
import { Props } from '../screens/OnboardingScreen';
import { StackActions } from '@react-navigation/native';
import { appStorage } from '../utils/StorageManager/setup';

export default function OnboardingContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const slides = [
        {
            id: 1,
            title: 'Welcome to the Virtual Nation of Pangea',
            text: 'United Citizens Wallet is your access point to a brand new world.',
            image: require('../assets/images/onboarding/1.png'),
        },
        {
            id: 2,
            title: 'Passwordless login to Pangea apps',
            text: 'No more passwords for every app you use! Using the secure login of Pangea.',
            image: require('../assets/images/onboarding/2.png'),
        },
        {
            id: 3,
            title: 'You control your data and citizenship',
            text: 'Your data is stored on your phone. Pangea and third parties can’t access it.',
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
        await appStorage.setSplashOnboarding(false);
        navigation.dispatch(StackActions.replace('Home'));
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
            <Swiper
                loop={false}
                index={activeIndex}
                onIndexChanged={(index) => setActiveIndex(index)}
                showsPagination={true}
                dotStyle={styles.dot}
                activeDotStyle={styles.activeDot}
                containerStyle={{ flex: 0.7 }}
            >
                {slides.map((slide, index) => (
                    <View style={styles.slide} key={slide.id}>
                        <Image source={slide.image} style={styles.image} />
                    </View>
                ))}
            </Swiper>

            {/* Title and Text */}
            <View style={styles.main}>
                <View style={styles.content}>
                    <Text style={styles.title}>{slides[activeIndex].title}</Text>
                    <Text style={styles.text}>{slides[activeIndex].text}</Text>
                </View>
                <View style={styles.buttonContainer}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 0.3,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        marginTop: 30,
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
    content: {
        gap: 10,
        flexDirection: 'column',
        width: '100%',
        padding: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        lineHeight: 36,
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
        paddingHorizontal: 16,
        width: '100%',
        marginBottom: 40,
    },
    skipButton: {
        fontSize: 16,
    },
    nextButton: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: 40,
    },
});
