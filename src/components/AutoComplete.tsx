import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, TextInput } from 'react-native-paper';
import theme from '../utils/theme';

interface AutocompleteProps {
    value: string;
    label?: string;
    data: string[];
    containerStyle?: object;
    onChange: (text: string) => void;
    icon?: string;
    style?: object;
    menuStyle?: object;
    right?: () => JSX.Element;
    left?: () => JSX.Element;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
    value: origValue,
    label,
    data,
    onChange: origOnChange,
    menuStyle = {},
}) => {
    const [value, setValue] = useState<string>(origValue);
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [filteredData, setFilteredData] = useState<string[]>([]);

    const filterData = (text: string): string[] => {
        return data.filter((val) => val?.toLowerCase()?.indexOf(text?.toLowerCase()) > -1);
    };

    return (
        <View style={{ marginTop: 30 }}>
            <View style={styles.inputContainer}>
                <View style={styles.innerContainer}>
                    <TextInput
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
                </View>
            </View>
            {/* <TextInput
                underlineColor="transparent"
                mode="outlined"
                
                label={label}
                style={styles.input}
                value={value}
            /> */}
            {menuVisible && filteredData && filteredData?.length > 0 && (
                <View style={styles.menuView}>
                    {filteredData.map((datum, i) => (
                        <>
                            <Menu.Item
                                key={i}
                                style={[{ width: '100%' }, menuStyle]}
                                onPress={() => {
                                    setValue(datum);
                                    setMenuVisible(false);
                                }}
                                title={datum}
                            />
                            {i < filteredData.length - 1 && <View style={styles.horizontalLine} />}
                        </>
                    ))}
                </View>
            )}
        </View>
    );
};

export default Autocomplete;

const styles = StyleSheet.create({
    menuView: {
        borderWidth: 1,
        borderColor: theme.colors.disabled,
        borderRadius: 8,
        padding: 2,
        marginHorizontal: 4,
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
        borderWidth: 1,
        borderColor: theme.colors.disabled,
        borderRadius: 8,
        marginTop: 30,
    },
    horizontalLine: {
        borderBottomColor: '#E4E4E4',
        borderBottomWidth: 1,
    },
});
