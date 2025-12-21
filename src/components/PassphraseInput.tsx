import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AutoCompletePassphraseWord from '../components/AutoCompletePassphraseWord';
import theme, { commonStyles } from '../utils/theme';
import { util } from '@tonomy/tonomy-id-sdk';

interface PassphraseInputProps {
    value: string[];
    onChange: (passphrase: string[]) => void;
    setNextDisabled: (boolean) => void;
    disabled?: boolean;
}

const PassphraseInput: React.FC<PassphraseInputProps> = ({ value, onChange, setNextDisabled, disabled }) => {
    const [passphrase, setPassphrase] = useState<string[]>(value);

    useEffect(() => {
        onChange(passphrase);
    }, [passphrase, onChange]);

    async function onChangeWord(index: number, word: string) {
        setPassphrase((prev) => {
            const newPassphrase = [...prev];

            newPassphrase[index] = word;

            setNextDisabled(false);

            for (let i = 0; i < newPassphrase.length; i++) {
                if (!util.isKeyword(newPassphrase[i].toLowerCase())) {
                    setNextDisabled(true);
                }
            }

            return newPassphrase;
        });
    }

    return (
        <View>
            <View style={styles.columnContainer}>
                {passphrase.map((text, index) => (
                    <View key={index} style={styles.autoCompleteViewContainer}>
                        <Text style={styles.autoCompleteNumber}>{index + 1}.</Text>
                        <AutoCompletePassphraseWord
                            textInputStyle={styles.autoCompleteTextInput}
                            containerStyle={styles.autoCompleteContainer}
                            value={text}
                            onChange={(text) => onChangeWord(index, text)}
                            menuStyle={index < 2 ? styles.menuViewBottom : styles.menuViewTop}
                            disabled={disabled}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    errorText: {
        ...commonStyles.textAlignCenter,
        color: theme.colors.error,
    },
    menuViewTop: {
        bottom: 47,
    },
    menuViewBottom: {
        top: 47,
    },
    autoCompleteViewContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginRight: 15,
        marginBottom: 10,
    },
    autoCompleteContainer: {
        width: 120,
        marginTop: 22,
        justifyContent: 'flex-start',
        position: 'relative',
    },
    autoCompleteNumber: {
        marginRight: -15,
        marginLeft: 10,
        zIndex: -1,
    },
    autoCompleteTextInput: {
        width: 120,
        height: 42,
        marginTop: 22,
        justifyContent: 'center',
    },
    columnContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
});

export default PassphraseInput;
