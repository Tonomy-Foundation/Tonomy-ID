/* eslint-disable react/jsx-no-undef */
import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ScrollView, Image } from 'react-native';

import { Props } from '../screens/DataSharingConsentScreen';
import { commonStyles } from '../utils/theme';
import { TH4 } from '../components/atoms/THeadings';
import { TButtonText } from '../components/atoms/Tbutton';
import TList from '../components/TList';
import { Button, IconButton } from 'react-native-paper';
import PersonalInformationIcon from '../assets/icons/PersonalInformationIcon';

export default function DataSharingConsentContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.innerContainer}>
                    <Image width={8} height={8} source={require('../assets/tonomy/tonomy-logo48.png')}></Image>
                </View>
                <View style={styles.boarderPanel}>
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton
                            color={theme.colors.grey2}
                            style={{ marginLeft: 10 }}
                            icon="card-account-details"
                        ></IconButton>
                        <TH4 style={{ marginLeft: 20, marginTop: 12 }}>Personal Information</TH4>
                        <IconButton
                            color={theme.colors.grey2}
                            onPress={() => alert()}
                            style={{ position: 'absolute', right: 0, marginLeft: 'auto' }}
                            icon="clipboard-text-search-outline"
                        ></IconButton>
                    </View>

                    <View style={styles.infoListDetail}>
                        <TList bulletIcon="•" text="Name at Birth" />
                        <TList bulletIcon="•" text="Current Name" />
                        <TList bulletIcon="•" text="Last Name" />
                        <TList bulletIcon="•" text="*Date of Birth" />
                        <TList bulletIcon="•" text="Gender at Birth" />
                        <TList bulletIcon="•" text="Current gender" />
                        <TList bulletIcon="•" text="Address" />
                        <TList bulletIcon="•" text="Apartment and floor" />
                        <TList bulletIcon="•" text="Post Code" />
                        <TList bulletIcon="•" text="City" />
                        <TList bulletIcon="•" text="Country of Residence" />
                    </View>
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
