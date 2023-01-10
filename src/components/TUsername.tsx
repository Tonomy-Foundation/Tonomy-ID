
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput, HelperText } from 'react-native-paper';

export type TTextInputProps = React.ComponentProps<typeof TextInput> & { errorText?: string; suffix: string };

export default function TUsername(props: TTextInputProps) {
    const showError: boolean = !!props.errorText && props.errorText.length > 0;

    return (
        <View>
            <View style={styles.username}>
                <TextInput style={styles.usernameInput} {...props} error={showError} />
                <Text style={styles.accountSuffix}>{'.people' + props.suffix}</Text>
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
        textAlign: 'center',
    },
    usernameInput: {
        width: '60%',
        height: 45,
        backgroundColor: 'transparent',
        flex: 1,
    },
    accountSuffix: {
        width: '40%',
        marginLeft: 14,
        textAlignVertical: 'bottom',
        fontSize: 16,
    },
});
