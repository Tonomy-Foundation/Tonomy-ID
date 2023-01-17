import React from 'react';
import { StyleSheet } from 'react-native';
import TTextInput, { TTextInputProps } from './TTextInput';
import theme from '../../utils/theme';

export default function TPasswordInput(props: TTextInputProps) {
    return (
        <TTextInput
            underlineColor="transparent"
            mode="outlined"
            {...props}
            secureTextEntry={true}
            style={styles.input}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: 'transparent',
        marginBottom: 4,
        borderRadius: 6,
    },
});
