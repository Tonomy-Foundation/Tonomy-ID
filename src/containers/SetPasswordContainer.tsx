import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import TPasswordInput from '../components/molecules/TPasswordInput';
import TLink from '../components/atoms/TA';
import { TCaption, TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import { NavigationProp } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { SdkError, SdkErrors } from '@tonomy/tonomy-id-sdk';
import theme, { commonStyles } from '../utils/theme';
import TModal from '../components/TModal';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import useErrorStore from '../store/errorStore';
import TErrorModal from '../components/TErrorModal';
import { Props } from '../screens/CreateAccountPasswordScreen';
import TA from '../components/atoms/TA';

export default function SetPasswordContainer({ navigation }: Props) {
    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <View>
                            <View>
                                <TP size={1}>Password</TP>
                                <TPasswordInput style={commonStyles.marginBottom} />
                            </View>
                            <View>
                                <TP>Confirm Password</TP>
                                <TPasswordInput style={commonStyles.marginBottom} />
                            </View>
                            <View style={[commonStyles.marginBottom, commonStyles.alignItemsCenter]}>
                                <TP size={1} style={[styles.rememberPasswordText, styles.passwordText]}>
                                    Remember your password for future use
                                </TP>
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

const errorModalStyles = StyleSheet.create({
    marginTop: {
        marginTop: 6,
    },
});

const styles = StyleSheet.create({
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

const errorStyles = StyleSheet.create({
    labelError: {
        color: theme.colors.error,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
});
