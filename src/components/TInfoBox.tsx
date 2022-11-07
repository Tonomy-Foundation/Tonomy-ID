import React from 'react';
import { StyleSheet, Text, View, Image, IconSourcePropType } from 'react-native';
import TA from './TA';

export type TInfoBoxProps = {
    iconSource: IconSourcePropType;
    description: string;
    linkUrl: string;
    linkUrlText: string;
};

export default function TInfoBox(props: TInfoBoxProps) {
    return (
        <View style={styles.infoContainer}>
            <Image style={styles.icon} source={props.iconSource}></Image>
            <Text style={styles.description}>{props.description}</Text>
            <Text style={styles.description}>
                <TA href={props.linkUrl}>{props.linkUrlText}</TA>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    infoContainer: {
        marginTop: 30,
        alignSelf: 'center',
        backgroundColor: '#e1f2e2',
        borderRadius: 8,
        padding: 10,
        gap: 10,
        width: '90%',
    },
    icon: {
        alignSelf: 'center',
    },
    description: {
        textAlign: 'center',
        alignSelf: 'center',
        width: '90%',
    },
});
