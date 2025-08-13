import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    withRepeat,
    Easing,
} from 'react-native-reanimated';
import theme from '../utils/theme';

interface BubbleProps {
    text: string;
    delay: number;
    side?: string;
    style?: any;
}

export function Bubble({ text, delay, side = 'left', style }: BubbleProps) {
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withTiming(1, {
                duration: 3000,
                easing: Easing.inOut(Easing.ease),
            })
        );

        const duration = 1000; // duration for each leg of the diamond

        translateX.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(4, { duration, easing: Easing.linear }), // move right
                    withTiming(4, { duration, easing: Easing.linear }), // hold right
                    withTiming(-4, { duration, easing: Easing.linear }), // move left
                    withTiming(-4, { duration, easing: Easing.linear }) // hold left
                ),
                -1,
                true
            )
        );

        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-4, { duration, easing: Easing.linear }), // move up
                    withTiming(4, { duration, easing: Easing.linear }), // move down
                    withTiming(4, { duration, easing: Easing.linear }), // hold down
                    withTiming(-4, { duration, easing: Easing.linear }) // move back up
                ),
                -1,
                true
            )
        );
    }, []);

    const aStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }));

    const isLeft = side === 'left';

    return (
        <Animated.View
            style={[
                {
                    maxWidth: 220,
                    paddingHorizontal: 7,
                    paddingVertical: 6,
                    backgroundColor: 'white',
                    borderRadius: 16,
                    borderBottomLeftRadius: !isLeft ? 4 : 16,
                    borderBottomRightRadius: !isLeft ? 16 : 4,
                    alignSelf: isLeft ? 'flex-start' : 'flex-end',
                    marginVertical: 2,
                },
                style,
                aStyle,
            ]}
        >
            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.linkColor }}>{text}</Text>
        </Animated.View>
    );
}
