import React from 'react';
import { Text, StyleSheet } from 'react-native';

export function TH1(props: any) {
    return (
        <Text style={styles.h1} {...props}>
            {props.children}
        </Text>
    );
}

export function TH2(props: any) {
    return (
        <Text style={styles.h2} {...props}>
            {props.children}
        </Text>
    );
}

const styles = StyleSheet.create({
    h1: {
        fontSize: 30,
        marginBottom: 8,
    },
    h2: {
        fontSize: 24,
    },
});
