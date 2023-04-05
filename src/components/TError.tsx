import React from 'react';
import { StyleSheet } from 'react-native';
import { TCaption } from './atoms/THeadings';
import theme from '../utils/theme';

interface Props {
    style?: object;
    children: React.ReactNode;
}

export const TError = ({ style, children }: Props) => (
    <TCaption style={[styles.errorStyles, { ...style }]}>{children}</TCaption>
);

const styles = StyleSheet.create({
    errorStyles: {
        textAlign: 'right',
        color: theme.colors.error,
        fontSize: 14,
    },
});
