import React from 'react';
import { Text, StyleSheet, Linking } from 'react-native';
import theme from '../../utils/theme';

type AProps = {
    href: string;
};

export default function TLink(props: AProps & any) {
    const to = props.to ? props.to : props.href;

    return (
        <Text {...props} style={[styles.a, props.style]} onPress={() => Linking.openURL(to)}>
            {props.children}
        </Text>
    );
}

const styles = StyleSheet.create({
    a: {
        color: theme.colors.success,
        textDecorationLine: 'underline',
        fontSize: 14,
        fontWeight: '400',
    },
});
