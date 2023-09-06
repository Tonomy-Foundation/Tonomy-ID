import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Autocomplete from '../components/AutoComplete';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/ConfirmPassphraseScreen';
import theme, { commonStyles } from '../utils/theme';
import { displayScreenNumber } from '../utils/passphrase';
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
    const onNext = () => {
        if (index < 2) {
            navigation.push('ConfirmPassphrase', { index: index + 1 });
        } else {
            navigation.navigate('Hcaptcha');
        }
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
                                        {displayScreenNumber(randomWordIndexes[index] + 1)} word
                                    </TP>{' '}
                                    in your passphrase.
                                </TP>
                                <Autocomplete value={value} onChange={setValue} screenNumber={index} />
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
});
