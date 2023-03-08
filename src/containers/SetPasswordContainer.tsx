import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import TPasswordInput from '../components/molecules/TPasswordInput';

import { TP } from '../components/atoms/THeadings';

import theme, { commonStyles } from '../utils/theme';

import LayoutComponent from '../components/layout';

import { Props } from '../screens/CreateAccountPasswordScreen';
import TA from '../components/atoms/TA';

export default function SetPasswordContainer({ navigation }: Props) {
    return (
        <>
            <LayoutComponent
                body={
                    <View style={styles.container}>
                        <View style={styles.innerContainer}>
                            <View>
                                <TP size={1}>New master password</TP>
                                <TPasswordInput style={commonStyles.marginBottom} />
                            </View>
                            <View>
                                <TP>Confirm new master password</TP>
                                <TPasswordInput style={commonStyles.marginBottom} />
                            </View>
                        </View>
                    </View>
                }
                footer={
                    <View style={commonStyles.marginBottom}>
                        <TButtonContained>SUBMIT</TButtonContained>
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerContainer: {
        width: '100%',
        height: '60%',
    },
    rememberPasswordText: {
        color: theme.colors.error,
    },
    headline: {
        fontWeight: 'bold',
    },
    passwordText: {
        alignSelf: 'flex-end',
    },
    labelText: {
        color: theme.colors.primary,
    },
});
