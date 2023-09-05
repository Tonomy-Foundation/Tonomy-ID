import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Menu, TextInput } from 'react-native-paper';
import theme from '../utils/theme';
import useUserStore from '../store/userStore';

interface AutocompleteProps {
    value?: string;
    label?: string;
    onChange: (text: string) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ value: origValue, label, onChange: origOnChange }) => {
    const [value, setValue] = useState<string>(origValue || '');
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [filteredData, setFilteredData] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [textLength, setTextLength] = useState<number>(0);
    const { user } = useUserStore();

    const onChangeText = (text) => {
        origOnChange(text);
        setErrorMsg('');

        if (text && text.length > 0) {
            const suggestWords = user.suggestPassphraseWord(text);

            if (suggestWords?.length === 0) {
                if (!textLength || textLength === 0) {
                    setTextLength(text.length);
                }

                setErrorMsg('The combination of letters you provided is not a part of the selectable word list.');
            }

            setFilteredData(suggestWords);
        } else if (!text || text === '' || text.length === 0) {
            setFilteredData([]);
        }

        setMenuVisible(true);
        setValue(text);
    };

    return (
        <View>
            <View style={errorMsg ? styles.errorInput : styles.inputContainer}>
                <View style={styles.innerContainer}>
                    <View style={styles.coloredTextContainer}>
                        {value.split('').map((char, index) => (
                            <Text
                                key={index}
                                style={{ color: index < textLength - 1 || textLength === 0 ? '#474D4C' : '#F44336' }}
                            >
                                {char}
                            </Text>
                        ))}
                    </View>
                    <TextInput
                        value={value}
                        label={label}
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

                    {menuVisible && filteredData && filteredData?.length > 0 && (
                        <View style={styles.menuView}>
                            {filteredData.map((datum, i) => (
                                <View key={i} style={{ marginTop: -6 }}>
                                    <Menu.Item
                                        style={[{ width: '100%' }]}
                                        onPress={() => {
                                            setValue(datum);
                                            setMenuVisible(false);
                                        }}
                                        title={datum}
                                    />
                                    {i < filteredData.length - 1 && <View style={styles.horizontalLine} />}
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
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: 7,
        fontSize: 16,
    },
    inputContainer: {
        position: 'relative',
        borderWidth: 1,
        borderColor: theme.colors.disabled,
        borderRadius: 8,
    },
    horizontalLine: {
        borderBottomColor: '#E4E4E4',
        borderBottomWidth: 1,
    },
    errorMsg: {
        color: '#F44336',
        textAlign: 'center',
        fontSize: 14,
        marginTop: 5,
        lineHeight: 16,
    },

    errorInput: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#F44336',
        borderRadius: 8,
    },
});
