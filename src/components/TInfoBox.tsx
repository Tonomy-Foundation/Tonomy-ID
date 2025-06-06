import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import PrivacyIcon from '../assets/icons/PrivacyIcon';
import SecurityIcon from '../assets/icons/SecurityIcon';
import TransparencyIcon from '../assets/icons/TransparencyIcon';
import { TP } from './atoms/THeadings';
import theme from '../utils/theme';

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
            alignContent: 'stretch',
            flexDirection: props.align === 'center' ? 'column' : 'row',
            alignSelf: 'center',
            backgroundColor: theme.colors.info,
            borderRadius: 8,
            padding: 14,
            width: '100%',
        },
        icon: {
            alignSelf: 'center',
            marginBottom: props.align === 'center' ? 5 : 0,
            marginRight: props.align === 'center' ? 0 : 5,
        },
        description: {
            textAlign: props.align === 'center' ? 'center' : 'left',
            alignSelf: props.align === 'center' ? 'center' : 'auto',
            justifyContent: props.align === 'center' ? 'center' : 'flex-start',
            flex: props.align === 'center' ? 0 : 1,
        },
        link: {
            color: theme.colors.primary,
        },
        paragraph: {
            textAlign: props.align,
            textAlignVertical: 'center',
            letterSpacing: 0.2,
            lineHeight: 19,
            paddingLeft: 5,
            fontSize: 14,
            fontWeight: '400',
            color: theme.colors.text,
        },
    });

    return (
        <View style={styles.infoContainer}>
            <IconComponent style={styles.icon} icon={props.icon} />
            <View style={styles.description}>
                <TP style={styles.paragraph}>
                    {props.description} {/* TODO: uncomment link */}
                    {/* <TA style={[styles.description]} href={props.linkUrl}>
                        {props.linkUrlText}
                    </TA> */}
                </TP>
            </View>
        </View>
    );
}
