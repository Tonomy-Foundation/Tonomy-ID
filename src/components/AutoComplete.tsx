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
    const { user } = useUserStore();

    const onChangeText = (text) => {
        origOnChange(text);

        if (text && text.length > 0) {
            const suggestWords = user.suggestPassphraseWord(text);

            if (suggestWords?.length === 0) {
                setErrorMsg('The word you have entered is incorrect.Please  try again.');
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
            <View style={styles.inputContainer}>
                <View style={styles.innerContainer}>
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
        backgroundColor: 'transparent',
        width: '60%',
        height: 45,
        flex: 1,
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    },
});
