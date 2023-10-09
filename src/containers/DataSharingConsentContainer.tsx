/* eslint-disable react/jsx-no-undef */
import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ScrollView, Image } from 'react-native';

import { Props } from '../screens/DataSharingConsentScreen';
import { commonStyles } from '../utils/theme';
import { TH4 } from '../components/atoms/THeadings';

export default function DataSharingConsentContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.innerContainer}>
                    <Image width={8} height={8} source={require('../assets/tonomy/tonomy-logo48.png')}></Image>
                </View>
                <View style={styles.headerPanel}>
                    <TH4 style={commonStyles.textAlignCenter}>Jack Tanner</TH4>
                </View>
            </ScrollView>
            <Text>test ssss</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        textAlign: 'center',
    },
    logo: {
        width: 65,
        height: 65,
    },
    appDialog: {
        borderWidth: 1,
        borderColor: 'grey',
        borderStyle: 'solid',
        borderRadius: 8,
        padding: 16,
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        minHeight: 200,
    },
    innerContainer: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerPanel: {
        paddingTop: 10,
        paddingBottom: 20,
    },
});
