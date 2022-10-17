import React from 'react';
import { Text, StyleSheet, Linking } from 'react-native';
// import { Linking } from '@react-navigation/native';

type AProps = {
    href: string;
};

export default function TLink(props: AProps & any) {
    const to = props.to ? props.to : props.href;

    return (
        // <Text style={styles.a} {...props} onPress=>
        //     {props.children}
        // </Text>
        <Text onPress={() => Linking.openURL(to)}>{props.children}</Text>
    );
}

const styles = StyleSheet.create({
    a: {
        color: 'blue',
    },
});
