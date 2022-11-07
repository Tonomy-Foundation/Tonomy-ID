import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import PrivacyIcon from '../assets/icons/PrivacyIcon';
import SecurityIcon from '../assets/icons/SecurityIcon';
import TransparencyIcon from '../assets/icons/TransparencyIcon';
import TA from './TA';

export type TInfoBoxProps = {
    icon: string;
    description: string;
    linkUrl: string;
    linkUrlText: string;
};

function IconComponent(props: SvgProps & { icon: string }) {
    switch (props.icon) {
        case 'security':
            return <SecurityIcon {...props} />;
        case 'privacy':
            return <PrivacyIcon {...props} />;
        case 'transparency':
            return <TransparencyIcon {...props} />;
        default:
            throw new Error('Invalid icon name');
    }
}

export default function TInfoBox(props: TInfoBoxProps) {
    return (
        <View style={styles.infoContainer}>
            <IconComponent style={styles.icon} icon={props.icon}/>
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
