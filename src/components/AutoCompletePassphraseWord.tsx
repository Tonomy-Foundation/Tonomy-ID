import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Menu, TextInput } from 'react-native-paper';
import theme, { customColors } from '../utils/theme';
import { lib } from '@tonomy/tonomy-id-sdk';

/**
 * Represents an Autocomplete component.
 * This component provides an input field with autocompletion functionality.
 * It allows users to input text and provides suggestions based on the input.
 *
 * @component
 * @param {string} [value] - The default value of the Autocomplete input.
 * @param {string} [onChange] - A function to set the value of the field onChange
 */
interface AutocompleteProps {
    value?: string;
    onChange: (text: string) => void;
    textInputStyle?: object;
    containerStyle?: object;
}

const AutoCompletePassphraseWord: React.FC<AutocompleteProps> = ({
    value,
    onChange,
    textInputStyle,
    containerStyle,
}) => {
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [valueLength, setValueLength] = useState<number>(0);

    const onChangeText = (text) => {
        const newText = text.toLowerCase().replace(/[^a-z]/g, '');

        setErrorMsg('');
        onChange(newText);

        if (newText && newText.length > 0) {
            const suggestWords = lib.generateAutoSuggestions(newText);

            if (suggestWords?.length === 0) {
                if (!valueLength || valueLength === 0) {
                    setValueLength(newText.length);
                }

                setErrorMsg('Not in the world list.');
            } else setValueLength(0);

            setSuggestedWords(suggestWords);
        } else if (!newText || newText === '' || newText.length === 0) {
            setSuggestedWords([]);
        }

        setMenuVisible(true);
    };

    return (
        <View style={containerStyle}>
            <View style={errorMsg ? styles.errorInput : styles.inputContainer}>
                <View style={styles.innerContainer}>
                    <View style={styles.coloredTextContainer}>
                        {value &&
                            value.split('').map((char, index) => (
                                <Text
                                    key={index}
                                    style={{
                                        color:
                                            index < valueLength - 1 || valueLength === 0
                                                ? theme.colors.text
                                                : theme.colors.error,
                                    }}
                                >
                                    {char}
                                </Text>
                            ))}
                    </View>
                    <TextInput
                        value={value}
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        style={{ ...styles.input, ...textInputStyle }}
                        onFocus={() => {
                            if (!value || value?.length === 0) {
                                setMenuVisible(true);
                            }
                        }}
                        onChangeText={(text) => onChangeText(text)}
                    />

                    {menuVisible && suggestedWords && suggestedWords?.length > 0 && (
                        <View style={styles.menuView}>
                            {suggestedWords.map((word, i) => (
                                <View key={i} style={{ marginTop: -6 }}>
                                    <Menu.Item
                                        style={[{ width: '100%' }]}
                                        onPress={() => {
                                            setMenuVisible(false);
                                            onChange(word);
                                            setErrorMsg('');
                                        }}
                                        title={word}
                                    />
                                    {i < suggestedWords.length - 1 && <View style={styles.horizontalLine} />}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
            {errorMsg && <Text style={styles.errorMsg}>{errorMsg}</Text>}
        </View>
    );
};

export default AutoCompletePassphraseWord;

const styles = StyleSheet.create({
    coloredTextContainer: {
        flexDirection: 'row',
    },
    menuView: {
        borderRadius: 8,
        padding: 0,
        marginHorizontal: 2,
        width: '99%',
        elevation: 4,
        position: 'absolute',
        bottom: '110%',
        left: 0,
        backgroundColor: 'white',
    },
    input: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 45,
        opacity: 0,
        color: 'white',
        visibility: 'hidden',
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    inputContainer: {
        position: 'relative',
        borderWidth: 1,
        borderColor: theme.colors.disabled,
        borderRadius: 8,
    },
    horizontalLine: {
        borderBottomColor: theme.colors.grey5,
        borderBottomWidth: 1,
    },
    errorMsg: {
        color: theme.colors.error,
        textAlign: 'center',
        fontSize: 14,
        marginTop: 5,
        lineHeight: 16,
    },

    errorInput: {
        position: 'relative',
        borderWidth: 1,
        borderColor: theme.colors.error,
        borderRadius: 8,
    },
});
