import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Autocomplete from '../components/AutoComplete';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/ConfirmPassphraseScreen';
import theme, { commonStyles, customColors } from '../utils/theme';
import { numberToOrdinal } from '../utils/numbers';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import usePassphraseStore from '../store/passphraseStore';

export default function ConfirmPassphraseWordContainer({
    route,
    navigation,
}: {
    route: Props['route'];
    navigation: Props['navigation'];
}) {
    const { index } = route.params;
    const { passphraseList, checkWordAtIndex, randomWordIndexes } = usePassphraseStore();
    const [value, setValue] = useState<string>(passphraseList[randomWordIndexes[index]]);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const onNext = () => {
        if (index < 2) {
            navigation.push('ConfirmPassphrase', { index: index + 1 });
        } else {
            navigation.navigate('Hcaptcha');
        }
    };

    const onChange = (text) => {
        setValue(text);

        if (!checkWordAtIndex(randomWordIndexes[index], text)) {
            setErrorMsg('The word you have entered is incorrect.Please  try again.');
        } else setErrorMsg('');
    };

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Confirm passphrase</TH1>
                        <View style={{ marginTop: 60 }}>
                            <View style={styles.innerContainer}>
                                <TP style={styles.textStyle}>
                                    Please enter the{' '}
                                    <TP style={styles.boldText}>
                                        {numberToOrdinal(randomWordIndexes[index] + 1)} word
                                    </TP>{' '}
                                    in your passphrase.
                                </TP>
                                <Autocomplete value={value} onChange={(text) => onChange(text)} />
                                <Text style={styles.errorMsg}>{errorMsg}</Text>
                            </View>
                        </View>
                    </View>
                }
                footer={
                    <View>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained
                                disabled={!checkWordAtIndex(randomWordIndexes[index], value)}
                                onPress={onNext}
                            >
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
    headline: {
        marginTop: -10,
        fontSize: 20,
        marginBottom: 5,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        marginTop: 50,
        justifyContent: 'center',
    },
    textStyle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: theme.colors.grey1,
    },
    boldText: {
        fontWeight: 'bold',
    },
    errorMsg: {
        color: customColors.error,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 16,
        marginTop: 5,
    },
});
