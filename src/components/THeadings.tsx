import React from 'react';
import { A } from '@expo/html-elements';
import { Text, StyleSheet } from 'react-native';

export function TH1(props: any) {
    return (
        <Text style={styles.h1} {...props}>
            {props.children}
        </Text>
    );
}

export function TA(props: any) {
    return (
        <A {...props} />
    );
}

const styles = StyleSheet.create({
    h1: {
        fontSize: 24,
    },
});
