import React from 'react';
import { StyleSheet } from 'react-native';
import { Caption, Paragraph, Text } from 'react-native-paper';
import { customColors } from '../../utils/theme';

type THProps = React.ComponentProps<typeof Text>;

export function TH1(props: THProps) {
    return (
        // eslint-disable-next-line react/prop-types
        <Text {...props} style={[styles.h1, props.style]}>
            {props.children}
        </Text>
    );
}

export function TH2(props: THProps) {
    return (
        // eslint-disable-next-line react/prop-types
        <Text {...props} style={[styles.h2, props.style]}>
            {props.children}
        </Text>
    );
}

type TPProps = React.ComponentProps<typeof Paragraph> & { size?: 1 | 2 | 3 };

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
        marginTop: 15,
        marginBottom: 8,
        color: customColors.textBold,
        textAlign: 'center',
    },
    h2: {
        fontSize: 24,
    },
    s3: {
        fontSize: 20,
    },
    s2: {
        fontSize: 18,
    },
    s1: {
        fontSize: 16,
        textAlign: 'center',
    },
});
