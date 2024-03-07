import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import AutoCompletePassphraseWord from '../components/AutoCompletePassphraseWord';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/ConfirmPassphraseScreen';
import theme, { commonStyles } from '../utils/theme';
import { numberToOrdinal } from '../utils/numbers';
import { TButtonContained } from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import usePassphraseStore from '../store/passphraseStore';
import settings from '../settings';

export default function ConfirmPassphraseWordContainer({
    route,
    navigation,
}: {
    route: Props['route'];
    navigation: Props['navigation'];
}) {
    const { index } = route.params;
    const { passphraseList, checkWordAtIndex, randomWordIndexes, setConfirmPassphraseWord, confirmPassphraseWords } =
        usePassphraseStore();
    const [value, setValue] = useState<string>(
        settings.isProduction() ? confirmPassphraseWords[index] : passphraseList[randomWordIndexes[index]]
    );
    const [errorMsg, setErrorMsg] = useState<string>('');

    const onNext = () => {
        if (value && !checkWordAtIndex(randomWordIndexes[index], value)) {
            setErrorMsg('Incorrect word.Please try again.');
            return;
        }

        if (index < 2) {
            setConfirmPassphraseWord(index, value);
            navigation.push('ConfirmPassphrase', { index: index + 1 });
        } else {
            navigation.navigate('TermsAndCondition');
        }
    };

    const onChange = (text) => {
        setValue(text);
        setErrorMsg('');
    };

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={commonStyles.textAlignCenter}>Confirm passphrase</TH1>
                        <View style={{ marginTop: 5 }}>
                            <View style={styles.innerContainer}>
                                <TP style={styles.textStyle}>
                                    Please enter the{' '}
                                    <TP style={styles.boldText}>
                                        {numberToOrdinal(randomWordIndexes[index] + 1)} word
                                    </TP>{' '}
                                    in your passphrase.
                                </TP>
                                <AutoCompletePassphraseWord value={value} onChange={(text) => onChange(text)} />
                                <Text style={styles.errorMsg}>{errorMsg}</Text>
                            </View>
                        </View>
                    </View>
                }
                footer={
                    <View>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained onPress={onNext} disabled={!value || value === ''}>
                                Next
                            </TButtonContained>
                        </View>
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        marginTop: 70,
        justifyContent: 'center',
    },
    textStyle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: theme.colors.text,
    },
    boldText: {
        fontWeight: 'bold',
    },
    errorMsg: {
        color: theme.colors.error,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 16,
        marginTop: 5,
    },
});
