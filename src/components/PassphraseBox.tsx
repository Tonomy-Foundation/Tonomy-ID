import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

type PassphraseBoxProps = {
    number: string;
    text: string;
};

export default function PassphraseBox(props: PassphraseBoxProps) {
    const styles = StyleSheet.create({
        squareContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginRight: 15,
            marginBottom: 10,
        },
        square: {
            backgroundColor: '#F9F9F9',
            borderRadius: 8,
            borderColor: '#5B6261',
            borderWidth: 1,
            width: 120,
            height: 42,
            marginTop: 22,
            justifyContent: 'center',
        },
        numberText: {
            color: '#5B6261',
            fontSize: 14,
            fontWeight: '400',
            marginRight: -15,
            marginLeft: 10,
        },
        squareText: {
            textAlign: 'center',
            fontSize: 14,
        },
    });

    return (
        <View style={styles.squareContainer}>
            <Text style={styles.numberText}>{props.number}</Text>
            <View style={styles.square}>
                <Text style={styles.squareText}>{props.text}</Text>
            </View>
        </View>
    );
}
