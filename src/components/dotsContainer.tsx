import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import theme from '../utils/theme';

export default function dotsContainer() {
    return (
        <View style={styles.dotcontainer}>
            <View style={styles.dot}>
                <Text></Text>
            </View>
            <View style={styles.dot}></View>
            <View style={styles.dot}></View>
            <View style={styles.dot}></View>
            <View style={styles.dot}></View>
        </View>
    );
}

const styles = StyleSheet.create({
    dotcontainer: {
        alignContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
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
