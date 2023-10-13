/* eslint-disable react/jsx-no-undef */
import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ScrollView, Image } from 'react-native';

import { Props } from '../screens/DataSharingConsentScreen';
import theme, { commonStyles } from '../utils/theme';
import { TH4, TH2 } from '../components/atoms/THeadings';
import { TButtonContained, TButtonOutlined, TButtonText } from '../components/atoms/Tbutton';
import TList from '../components/TList';
import { IconButton } from 'react-native-paper';
import TInfoBox from '../components/TInfoBox';
import PersonalInformationIcon from '../assets/icons/PersonalInformationIcon';

export default function DataSharingConsentContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.userPictureAndName}>
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

                    <View style={{ marginLeft: 90 }}>
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
                        <TList bulletIcon="•" text="*Nationality" />
                    </View>
                </View>

                <View style={styles.innerContainer}>
                    <Text>*additional info required</Text>
                </View>

                <View style={styles.boarderPanel}>
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton
                            color={theme.colors.grey2}
                            style={{ marginLeft: 10 }}
                            icon="account-circle-outline"
                        ></IconButton>
                        <TH4 style={{ marginLeft: 20, marginTop: 12 }}>Profile Information</TH4>
                        <IconButton
                            color={theme.colors.grey2}
                            onPress={() => alert()}
                            style={{ position: 'absolute', right: 0, marginLeft: 'auto' }}
                            icon="clipboard-text-search-outline"
                        ></IconButton>
                    </View>

                    <View style={{ marginLeft: 90 }}>
                        <View>
                            <TList bulletIcon="•" text="Username" />
                            <TList bulletIcon="•" text="Anonymous User ID" />
                        </View>
                    </View>
                </View>

                <View style={styles.boarderPanel}>
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton
                            color={theme.colors.grey2}
                            style={{ marginLeft: 10 }}
                            icon="account-circle-outline"
                        ></IconButton>
                        <TH4 style={{ marginLeft: 20, marginTop: 12 }}>Application Data</TH4>
                        <IconButton
                            color={theme.colors.grey2}
                            onPress={() => alert()}
                            style={{ position: 'absolute', right: 0, marginLeft: 'auto' }}
                            icon="clipboard-text-search-outline"
                        ></IconButton>
                    </View>

                    <View style={{ alignItems: 'center' }}>
                        <Text>From the App</Text>
                        <Image width={8} height={8} source={require('../assets/medilab.png')}></Image>
                        <TH2>Medi Lab</TH2>
                        <TButtonText onPress={() => alert()}>
                            <Text style={{ color: theme.colors.primary }}>https://www.medilab.nl/</Text>
                        </TButtonText>
                    </View>
                    <View style={{ marginLeft: 90 }}>
                        <TList bulletIcon="•" text="Conditions" />
                        <TList bulletIcon="•" text="Lab Results" />
                        <TList bulletIcon="•" text="Medications" />
                    </View>
                </View>
                <View style={styles.infoBox}>
                    <TInfoBox
                        align="left"
                        icon="security"
                        description="Your personal info is self-sovereign meaning only you control who you share it with! Learn more"
                        linkUrl="test"
                        linkUrlText="Learn more"
                    />
                </View>
                <View>
                    <TButtonContained style={{ margin: 10 }} onPress={() => alert()}>
                        Next
                    </TButtonContained>
                    <TButtonOutlined style={{ margin: 10 }} onPress={() => alert()}>
                        Cancel
                    </TButtonOutlined>
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
        justifyContent: 'space-between',
        backgroundColor: '#FDFEFF',
    },
    userPictureAndName: {
        marginTop: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    innerContainer: {
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
        marginRight: 30,
        marginLeft: 30,
        marginTop: 20,
    },
    infoBox: {
        margin: 20,
    },
});
