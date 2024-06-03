import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AutoCompletePassphraseWord from '../components/AutoCompletePassphraseWord';
import theme, { commonStyles } from '../utils/theme';
import { util } from '@tonomy/tonomy-id-sdk';

interface PassphraseInputProps {
    initialPassphrase: string[];
    onPassphraseChange: (passphrase: string[]) => void;
}

const PassphraseInput: React.FC<PassphraseInputProps> = ({ initialPassphrase, onPassphraseChange }) => {
    const [passphrase, setPassphrase] = useState<string[]>(initialPassphrase);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        onPassphraseChange(passphrase);
    }, [passphrase]);

    const onChangeWord = (index: number, word: string) => {
        setErrorMessage('');

        setPassphrase((prev) => {
            const newPassphrase = [...prev];

            newPassphrase[index] = word;

            let hasError = false;

            for (let i = 0; i < newPassphrase.length; i++) {
                if (!util.isKeyword(newPassphrase[i])) {
                    hasError = true;
                }
            }

            if (hasError) {
                setErrorMessage('Incorrect passphrase. Please try again.');
            }

            return newPassphrase;
        });
    };

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
                        />
                    </View>
                ))}
            </View>
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
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
