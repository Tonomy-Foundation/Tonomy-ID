import React from 'react';
import { StyleSheet } from 'react-native';
import { Caption, Paragraph, Text } from 'react-native-paper';
import { customColors, useAppTheme } from '../../utils/theme';

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

export function TH4(props: THProps) {
    return (
        // eslint-disable-next-line react/prop-types
        <Text {...props} style={[styles.h4, props.style]}>
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
    const theme = useAppTheme();
    const style = {
        color: theme.colors.textGray,
    };

    return <Caption style={[style, styles.s1, props.style]}>{props.children}</Caption>;
}

const styles = StyleSheet.create({
    h1: {
        fontSize: 24,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
    },
    h4: {
        fontSize: 16,
    },
    s4: {
        fontSize: 20,
    },
    s3: {
        fontSize: 18,
    },
    s2: {
        fontSize: 16,
    },
    s1: {
        fontSize: 14,
    },
});
