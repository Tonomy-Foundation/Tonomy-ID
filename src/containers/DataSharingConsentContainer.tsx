/* eslint-disable react/jsx-no-undef */
import React, { useState } from 'react';
import { Text, StyleSheet, View, ScrollView, Image } from 'react-native';

import { Props } from '../screens/DataSharingConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import { TH4 } from '../components/atoms/THeadings';
import { TButtonText } from '../components/atoms/Tbutton';
import TList from '../components/TList';
import { Button } from 'react-native-paper';

export default function DataSharingConsentContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.innerContainer}>
                    <Image width={8} height={8} source={require('../assets/tonomy/Tonomy-Foundation.png')}></Image>
                    <TH4 style={commonStyles.textAlignCenter}>Jack Tanner</TH4>
                </View>
                <View style={styles.innerContainer}>
                    <Image width={8} height={8} source={require('../assets/asnbank.png')}></Image>
                </View>
                <View style={styles.innerContainer}>
                    <TH4>ASN Bank</TH4>
                    <TButtonText onPress={() => alert()}>
                        <Text style={{ color: theme.colors.primary }}>https://www.asnbank.nl/</Text>
                    </TButtonText>
                    <Text>Is requesting access to following data:</Text>
                </View>
                <View style={styles.boarderPanel}>
                    <Button icon="card-account-details">
                        <TH4>Personal Information</TH4>
                    </Button>

                    <View style={styles.infoListDetail}>
                        <TList bulletIcon="•" text="Name at Birth" />
                        <TList bulletIcon="•" text="Current Name" />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#FDFEFF',
        paddingTop: 30,
    },
    innerContainer: {
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerPanel: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    boarderPanel: {
        borderRadius: 8,
        borderColor: '#000000',
        borderWidth: 1,
        marginRight: 40,
        marginLeft: 40,
        marginTop: 5,
    },
    infoListDetail: {
        marginLeft: 100,
    },
});
