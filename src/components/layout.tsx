import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type layoutProps = {
    body: JSX.Element;
    footerHint?: JSX.Element;
    footer?: JSX.Element;
};

export default function LayoutComponent(props: layoutProps) {
    const [keyboardStatusShown, setKeyboardStatusShown] = useState<boolean>();

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardStatusShown(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardStatusShown(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);
    return (
        <SafeAreaView style={layoutStyles.container}>
            {props.body && <View style={[layoutStyles.body, { flex: keyboardStatusShown ? 2 : 3 }]}>{props.body}</View>}
            {props.footerHint && !keyboardStatusShown ? (
                <View style={layoutStyles.footerHint}>{props.footerHint}</View>
            ) : (
                <View style={layoutStyles.footerHint}>
                    <Text>&nbsp;</Text>
                </View>
            )}
            {props.footer && <View style={layoutStyles.footer}>{props.footer}</View>}
        </SafeAreaView>
    );
}

const layoutStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FDFEFF',
    },
    body: { flex: 3 },
    footerHint: { flex: 1, justifyContent: 'flex-end' },
    footer: { flex: 1.2, flexDirection: 'column', justifyContent: 'flex-start' },
});
