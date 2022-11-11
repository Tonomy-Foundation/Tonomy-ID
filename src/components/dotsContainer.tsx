import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import theme from '../utils/theme';
//TODO container to component
export default function dotsContainer() {
    return <View style={styles.dot}></View>;
}

const styles = StyleSheet.create({
    dot: {
        margin: 10,
        marginTop: 20,
        marginBottom: 20,
        height: 20,
        width: 20,
        borderRadius: 1000,
        backgroundColor: theme.colors.disabled,
    },
});
