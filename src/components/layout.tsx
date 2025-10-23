import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type layoutProps = {
    body: JSX.Element;
    footerHint?: JSX.Element;
    footer?: JSX.Element;
    noFooterHintLayout?: boolean;
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
        <View style={layoutStyles.container}>
            {props.body && <View style={[layoutStyles.body, { flex: keyboardStatusShown ? 2 : 3 }]}>{props.body}</View>}
            {props.footerHint && !keyboardStatusShown ? (
                <View style={layoutStyles.footerHint}>{props.footerHint}</View>
            ) : (
                <>
                    {!props.noFooterHintLayout && (
                        <View style={layoutStyles.nofooterHint}>
                            <Text>&nbsp;</Text>
                        </View>
                    )}
                </>
            )}
            {props.footer && <View style={layoutStyles.footer}>{props.footer}</View>}
        </View>
    );
}

const layoutStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FDFEFF',
    },
    body: { flex: 2.8 },
    footerHint: { flex: 1.2, justifyContent: 'flex-end' },
    nofooterHint: { flex: 1.3, justifyContent: 'flex-end' },
    footer: {
        flex: 1.2,
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
});
