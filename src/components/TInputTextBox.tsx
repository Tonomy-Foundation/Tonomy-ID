import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import theme from '../utils/theme';
import { TCaption } from './atoms/THeadings';

export type TTextInputProps = React.ComponentProps<typeof TextInput> & { errorText?: string };

export default function TInputTextBox(props: TTextInputProps) {
    const showError: boolean = !!props.errorText && props.errorText.length > 0;

    return (
        <View>
            <View style={styles.inputContainer}>
                <View style={styles.username}>
                    <TextInput
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        style={styles.usernameInput}
                        {...props}
                    />
                </View>
            </View>

            {showError && <TCaption style={styles.errorStyles}>{props.errorText}</TCaption>}
        </View>
    );
}

const styles = StyleSheet.create({
    username: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    usernameInput: {
        backgroundColor: 'transparent',
        width: '60%',
        height: 45,
        flex: 1,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: theme.colors.disabled,
        borderRadius: 8,
    },
    accountSuffix: {
        width: '40%',
        marginLeft: 14,
        textAlignVertical: 'bottom',
        fontSize: 16,
    },
    errorStyles: {
        textAlign: 'right',
        color: theme.colors.error,
        fontSize: 14,
    },
});
