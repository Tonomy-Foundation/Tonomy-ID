import React from 'react';
import { StyleSheet, View } from 'react-native';
import Autocomplete from '../components/AutoComplete';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/ConfirmPasswordScreen';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';

export default function ConfirmPassphraseContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Confirm passphrase</TH1>
                        <View style={{ marginTop: 60 }}>
                            <View style={styles.innerContainer}>
                                <TP style={styles.textStyle}>
                                    Please enter the <TP style={styles.boldText}>3rd word</TP> in your passphrase.
                                </TP>
                                <Autocomplete label="" />
                            </View>
                        </View>
                    </View>
                }
                footer={
                    <View>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained>NEXT</TButtonContained>
                        </View>
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}

const styles = StyleSheet.create({
    headline: {
        marginTop: -20,
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
