import React from 'react';
import { StyleSheet, View } from 'react-native';
import Autocomplete from '../components/AutoComplete';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/ConfirmPasswordScreen';
import { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import usePassphraseStore from '../store/passphraseStore';

export default function ConfirmPassphraseContainer({ navigation }: { navigation: Props['navigation'] }) {
    const { setFirstWord, firstWord, checkWordAtIndex } = usePassphraseStore();

    const handleChangeText = (text) => {
        setFirstWord(text);
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
                                    Please enter the <TP style={styles.boldText}>1st word</TP> in your passphrase.
                                </TP>
                                <Autocomplete
                                    label=""
                                    value={firstWord}
                                    setPassphraseValue={handleChangeText}
                                    index={1}
                                />
                            </View>
                        </View>
                    </View>
                }
                footer={
                    <View>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained disabled={!checkWordAtIndex(1, thirdWord)}>NEXT</TButtonContained>
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
        color: '#5B6261',
    },
    boldText: {
        fontWeight: 'bold',
    },
});
