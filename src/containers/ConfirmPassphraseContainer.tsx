import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/ConfirmPasswordScreen';
import { commonStyles } from '../utils/theme';

export default function ConfirmPasswordContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <>
            <LayoutComponent
                body={
                    <View style={styles.container}>
                        <View style={styles.innerContainer}></View>
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
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        width: '100%',
        height: '60%',
    },
});
