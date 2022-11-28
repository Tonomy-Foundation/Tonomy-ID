import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import PrivacyIcon from '../assets/icons/PrivacyIcon';
import SecurityIcon from '../assets/icons/SecurityIcon';
import TransparencyIcon from '../assets/icons/TransparencyIcon';
import TA from './atoms/TA';

export type TInfoBoxProps = {
    icon: string;
    align: 'left' | 'center';
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
    const styles = StyleSheet.create({
        infoContainer: {
            flex: 0,
            flexDirection: props.align === 'center' ? 'column' : 'row',
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
            marginBottom: props.align === 'center' ? 5 : 0,
            marginRight: props.align === 'center' ? 0 : 8,
        },
        description: {
            textAlign: props.align === 'center' ? 'center' : 'left',
            alignSelf: props.align === 'center' ? 'center' : 'auto',
            width: '90%',
        },
    });

    return (
        <View style={styles.infoContainer}>
            <IconComponent style={styles.icon} icon={props.icon} />
            <Text style={styles.description}>
                {props.description}
                {' '}
                <TA href={props.linkUrl}>{props.linkUrlText}</TA>
            </Text>
        </View>
    );
}
