import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type layoutProps = {
    body: JSX.Element;
    footerHint?: JSX.Element;
    footer?: JSX.Element;
};

export default function LayoutComponent(props: layoutProps) {
    return (
        <SafeAreaView style={layoutStyles.container}>
            {props.body && <View style={layoutStyles.body}>{props.body}</View>}
            {props.footerHint ? (
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
        paddingHorizontal: 20,
    },
    body: { flex: 3 },
    footerHint: { flex: 1, justifyContent: 'flex-end' },
    footer: { flex: 1, gap: 40, flexDirection: 'column', justifyContent: 'flex-start' },
});
