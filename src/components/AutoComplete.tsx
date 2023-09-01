import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, TextInput } from 'react-native-paper';
import theme from '../utils/theme';

interface AutocompleteProps {
    value?: string;
    label?: string;
    data: string[];

    onChange: (text: string) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ value: origValue, label, data, onChange: origOnChange }) => {
    const [value, setValue] = useState<string>(origValue || '');
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [filteredData, setFilteredData] = useState<string[]>([]);

    const filterData = (text: string): string[] => {
        return data.filter((val) => val?.toLowerCase()?.indexOf(text?.toLowerCase()) > -1);
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
                        onChangeText={(text) => {
                            origOnChange(text);

                            if (text && text.length > 0) {
                                setFilteredData(filterData(text));
                            } else if (text && text.length === 0) {
                                setFilteredData(data);
                            }

                            setMenuVisible(true);
                            setValue(text);
                        }}
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
});
