import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Animated } from 'react-native';
import theme from '../utils/theme';
import CloseIcon from '../assets/icons/CloseIcon';
import { appStorage } from '../utils/StorageManager/setup';
import useErrorStore from '../store/errorStore';
import settings from '../settings';

const { width } = Dimensions.get('window');
const numberOfTabs = 5;
const tabWidth = width / numberOfTabs;

const AppInstructionProvider = () => {
    const [currentTip, setCurrentTip] = useState(0);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const opacity = useRef(new Animated.Value(1)).current;

    const errorStore = useErrorStore();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const showInstructions = await appStorage.getAppInstruction();

                setShowOnboarding(showInstructions);
            } catch (error) {
                errorStore.setError({ error, expected: false });
            }
        };

        fetchSettings();
    }, [errorStore]);

    const tips = [
        {
            title: `${settings.config.ecosystemName} citizenship`,
            text: [`Find out what awaits you as a citizen of the ${settings.config.ecosystemName} world`],
            tabIndex: 0,
        },
        {
            title: 'Assets',
            text: [`Send and receive ${settings.config.currencySymbol}, ETH and other cryptocurrencies`],
            tabIndex: 1,
        },
        {
            title: 'Scan QR codes for login and sign crypto transactions',
            text: [settings.config.ecosystemName, 'WalletConnect', 'Anchor (Antelope)'],
            tabIndex: 2,
        },
        {
            title: `Explore ${settings.config.ecosystemName}`,
            text: [`Get involved in ${settings.config.ecosystemName}'s community and learn about its ecosystem`],
            tabIndex: 3,
        },
        {
            title: 'Apps',
            text: ["Find out what services you're connected to so you can manage your data"],
            tabIndex: 4,
        },
    ];

    const fadeIn = () => {
        Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const fadeOut = () => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            // Update to the next tip and fade in
            if (currentTip < tips.length - 1) {
                setCurrentTip(currentTip + 1);
                fadeIn();
            } else {
                onClose();
            }
        });
    };

    const nextTip = () => {
        fadeOut();
    };

    const onClose = async () => {
        try {
            setShowOnboarding(false);
            await appStorage.setAppInstruction(false);
        } catch (error) {
            errorStore.setError({ error, expected: false });
        }
    };

    const bottomPosNormal = Platform.OS === 'ios' ? 80 : 60;
    const bottomPosScan = Platform.OS === 'ios' ? 115 : 80;

    return (
        showOnboarding && (
            <Animated.View
                style={[styles.modalContainer, { opacity, bottom: currentTip === 2 ? bottomPosScan : bottomPosNormal }]}
            >
                <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                    <CloseIcon color={theme.colors.black} />
                </TouchableOpacity>
                <View style={styles.modalContent}>
                    <View style={{ gap: 8 }}>
                        <Text style={styles.tipTitle}>{tips[currentTip].title}</Text>
                        <View style={{ gap: 3 }}>
                            {tips[currentTip].text.map((text, index) => (
                                <View key={index} style={tips[currentTip].text.length > 1 ? styles.bulletItem : {}}>
                                    {tips[currentTip].text.length > 1 && <Text style={styles.bulletPoint}>•</Text>}
                                    <Text style={styles.tipText}>{text}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.pagination}>{`${currentTip + 1} of ${tips.length}`}</Text>
                        <TouchableOpacity onPress={nextTip} style={styles.nextButton}>
                            <Text style={styles.nextText}>{currentTip === tips.length - 1 ? "Let's go!" : 'Next'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.arrow, { left: tips[currentTip].tabIndex * tabWidth + tabWidth / 2 - 8 }]} />
            </Animated.View>
        )
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        zIndex: 99,
        position: 'absolute',
        bottom: 80,
        width: '100%',
        padding: 16,
    },
    closeIcon: {
        position: 'absolute',
        right: 25,
        top: 25,
        zIndex: 10,
    },
    arrow: {
        position: 'absolute',
        bottom: 8,
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: theme.colors.secondary2,
    },
    modalContent: {
        width: '100%',
        backgroundColor: theme.colors.secondary2,
        padding: 20,
        borderRadius: 10,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bulletPoint: {
        fontSize: 16,
        lineHeight: 24,
        marginRight: 6,
        color: theme.colors.black,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.black,
    },
    tipText: {
        fontSize: 15,
        color: theme.colors.black,
    },
    pagination: {
        fontSize: 15,
        color: theme.colors.black,
    },
    footer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nextButton: {
        alignItems: 'center',
        borderColor: theme.colors.black,
        borderWidth: 1,
        paddingHorizontal: 26,
        paddingVertical: 12,
        borderRadius: 4,
    },
    nextText: {
        fontSize: 15,
        color: theme.colors.black,
    },
});

export default AppInstructionProvider;
