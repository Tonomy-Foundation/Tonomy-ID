import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import theme from '../../utils/theme';

export type TTextInputProps = React.ComponentProps<typeof TextInput> & { errorText?: string };

export default function TTextInput(props: TTextInputProps) {
    const showError: boolean = !!props.errorText && props.errorText.length > 0;

    return (
        <>
            <TextInput {...props} error={showError} />
            {showError && <Text style={styles.errorText}>{props.errorText}</Text>}
        </>
    );
}

const styles = StyleSheet.create({
    errorText: {
        color: theme.colors.error,
    },
});
