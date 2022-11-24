import React from 'react';
import { StyleSheet } from 'react-native';
import { Caption, Paragraph, Text } from 'react-native-paper';
import { customColors } from '../utils/theme';
export function TH1(props: any) {
    return (
        <Text {...props} style={[styles.h1]}>
            {props.children}
        </Text>
    );
}

export function TH2(props: any) {
    return (
        <Text {...props} style={styles.h2}>
            {props.children}
        </Text>
    );
}
type TPProps = React.ComponentProps<typeof Paragraph> & { size: 1 | 2 | 3 };

export function TP(props: TPProps) {
    return (
        // eslint-disable-next-line react/prop-types
        <Paragraph style={[props.size ? styles[('s' + props.size) as keyof typeof styles] : styles.s1, props.style]}>
            {props.children}
        </Paragraph>
    );
}
type TCaptionProps = React.ComponentProps<typeof Caption>;
export function TCaption(props: TCaptionProps) {
    // eslint-disable-next-line react/prop-types
    return <Caption style={props.style}>{props.children}</Caption>;
}
const styles = StyleSheet.create({
    h1: {
        fontSize: 30,
        marginBottom: 8,
        color: customColors.textBold,
    },
    h2: {
        fontSize: 24,
    },

    s1: {
        fontSize: 16,
    },
    s2: {
        fontSize: 18,
    },
    s3: {
        fontSize: 20,
    },
});
