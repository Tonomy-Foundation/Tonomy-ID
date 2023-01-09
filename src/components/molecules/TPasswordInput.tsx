import React from 'react';
import { StyleSheet } from 'react-native';
import TTextInput, { TTextInputProps } from './TTextInput';
import theme from '../../utils/theme';

export default function TPasswordInput(props: TTextInputProps) {
    return <TTextInput {...props} secureTextEntry={true} style={styles.input} />;
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
        marginBottom: 4,
        borderRadius: 6,
    },
});
