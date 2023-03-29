import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';

export type TTextInputProps = React.ComponentProps<typeof TextInput> & { errorText?: string };

export default function TUsername(props: TTextInputProps) {
    const showError: boolean = !!props.errorText && props.errorText.length > 0;

    return (
        <View>
            <View style={styles.username}>
                <TextInput underlineColor="transparent" style={styles.usernameInput} {...props} error={showError} />
            </View>
            {showError && (
                <View>
                    <HelperText type="error" visible={showError}>
                        {props.errorText}
                    </HelperText>
                </View>
            )}
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
    accountSuffix: {
        width: '40%',
        marginLeft: 14,
        textAlignVertical: 'bottom',
        fontSize: 16,
    },
});
