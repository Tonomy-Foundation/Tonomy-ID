import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Menu, TextInput } from 'react-native-paper';
import theme, { customColors } from '../utils/theme';
import useUserStore from '../store/userStore';
import usePassphraseStore from '../store/passphraseStore';

/**
 * Represents an Autocomplete component.
 * This component provides an input field with autocompletion functionality.
 * It allows users to input text and provides suggestions based on the input.
 *
 * @component
 * @param {string | undefined} props.value - The default value of the Autocomplete input.
 * @param {number | undefined} props.screenNumber - this screenNumber used to enable/disabled the next button so we can check on which screen number user exists then we match word with that index value in passphraseList
 * @param {(text: string) => void} props.setPassphraseValue - A function to set the value of the current number of screen
 */
interface AutocompleteProps {
    value?: string;
    onChange: (text: string) => void;
    screenNumber?: number;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ value, screenNumber, onChange }) => {
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [valueLength, setValueLength] = useState<number>(0);
    const { user } = useUserStore();
    const { checkWordAtIndex, randomWordIndexes } = usePassphraseStore();

    const onChangeText = (text) => {
        setErrorMsg('');
        onChange(text);

        if (text && text.length > 0) {
            const suggestWords = user.suggestPassphraseWord(text);

            if (suggestWords?.length === 0) {
                if (!valueLength || valueLength === 0) {
                    setValueLength(text.length);
                }

                setErrorMsg('The combination of letters you provided is not a part of the selectable word list.');
            } else setValueLength(0);

            setSuggestedWords(suggestWords);
        } else if (!text || text === '' || text.length === 0) {
            setSuggestedWords([]);
        }

        setMenuVisible(true);
    };

    return (
        <View>
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
                                                : customColors.error,
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
                        style={styles.input}
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

                                            if (
                                                screenNumber &&
                                                !checkWordAtIndex(randomWordIndexes[screenNumber], word)
                                            ) {
                                                setErrorMsg(
                                                    'The word you have entered is incorrect.Please  try again.'
                                                );
                                            }
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
            <Text style={styles.errorMsg}>{errorMsg}</Text>
        </View>
    );
};

export default Autocomplete;

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
        color: customColors.error,
        textAlign: 'center',
        fontSize: 14,
        marginTop: 5,
        lineHeight: 16,
    },

    errorInput: {
        position: 'relative',
        borderWidth: 1,
        borderColor: customColors.error,
        borderRadius: 8,
    },
});
