import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import TInfoBox from '../components/TInfoBox';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import { Images } from '../assets';
import { useNavigation } from '@react-navigation/native';
import { SessionTypes } from '@walletconnect/types';
import { currentETHAddress, web3wallet, _pair } from '../services/WalletConnect/Web3WalletClient';

export default function WalletConnectLoginContainer({
    payload,
    platform,
}: {
    payload: any;
    platform: 'mobile' | 'browser';
}) {
    const navigation = useNavigation();

    console.log('requestSession', payload);

    const onCancel = () => {
        navigation.navigate('Drawer', { screen: 'UserHome' });
    };

    async function handleAccept() {
        const { id, params } = payload;
        const { requiredNamespaces, relays } = params;

        if (payload) {
            const namespaces: SessionTypes.Namespaces = {};

            Object.keys(requiredNamespaces).forEach((key) => {
                const accounts: string[] = [];

                requiredNamespaces[key].chains.map((chain) => {
                    [currentETHAddress].map((acc) => accounts.push(`${chain}:${acc}`));
                });

                namespaces[key] = {
                    accounts,
                    methods: requiredNamespaces[key].methods,
                    events: requiredNamespaces[key].events,
                };
            });

            await web3wallet.approveSession({
                id,
                relayProtocol: relays[0].protocol,
                namespaces,
            });
            navigation.navigate('Drawer', { screen: 'UserHome' });
        }
    }

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <Image
                        style={[styles.logo, commonStyles.marginBottom]}
                        source={Images.GetImage('logo1024')}
                    ></Image>

                    {/* {username && <TH1 style={commonStyles.textAlignCenter}>{username}</TH1>}

                    {ssoApp && (
                        <View style={[styles.appDialog, styles.marginTop]}>
                            <Image style={styles.appDialogImage} source={{ uri: ssoApp.logoUrl }} />
                            <TH1 style={commonStyles.textAlignCenter}>{ssoApp.appName}</TH1>
                            <TP style={commonStyles.textAlignCenter}>Wants you to log in to their application here:</TP>
                            <TLink to={ssoApp.origin}>{ssoApp.origin}</TLink>
                        </View>
                    )} */}
                </View>
            }
            footer={
                <View>
                    <TButtonContained style={commonStyles.marginBottom} onPress={() => handleAccept()}>
                        Accept
                    </TButtonContained>
                    <TButtonOutlined onPress={onCancel}>Cancel</TButtonOutlined>
                </View>
            }
        ></LayoutComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        textAlign: 'center',
    },
    logo: {
        width: 100,
        height: 100,
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
    appDialogImage: {
        aspectRatio: 1,
        height: 50,
        resizeMode: 'contain',
    },
    marginTop: {
        marginTop: 10,
    },
    infoBox: {
        marginBottom: 32,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
