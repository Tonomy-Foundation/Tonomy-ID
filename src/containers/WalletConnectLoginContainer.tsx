import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import TInfoBox from '../components/TInfoBox';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import theme, { commonStyles } from '../utils/theme';
import settings from '../settings';
import { useNavigation } from '@react-navigation/native';
import { SessionTypes } from '@walletconnect/types';
import { currentETHAddress, web3wallet, _pair } from '../services/WalletConnect/Web3WalletClient';
import { getSdkError } from '@walletconnect/utils';

export default function WalletConnectLoginContainer({
    payload,
    platform,
}: {
    payload: any;
    platform: 'mobile' | 'browser';
}) {
    const navigation = useNavigation();
    const { name, url, icons } = payload?.params?.proposer?.metadata ?? {};
    const { id, params } = payload;

    const onCancel = async () => {
        await web3wallet.rejectSession({
            id: id,
            reason: getSdkError('USER_REJECTED'),
        });
        navigation.navigate('Drawer', { screen: 'UserHome' });
    };

    async function handleAccept() {
        const { requiredNamespaces, relays } = params;

        if (payload) {
            const namespaces: SessionTypes.Namespaces = {};

            try {
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
            } catch (e) {
                console.log('error ');
                await web3wallet.rejectSession({
                    id: id,
                    reason: getSdkError('EXPIRED'),
                });
            }
        }
    }

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <View style={[styles.networkHeading, styles.marginTop]}>
                        <Image source={require('../assets/icons/eth-img.png')} style={styles.imageStyle} />
                        <Text style={styles.nameText}>Ethereum Network</Text>
                    </View>

                    {currentETHAddress && (
                        <Text style={commonStyles.textAlignCenter}>
                            {currentETHAddress.substring(0, 9)}....
                            {currentETHAddress.substring(currentETHAddress.length - 8)}
                        </Text>
                    )}

                    <View style={[styles.appDialog, styles.marginTop]}>
                        <Image style={styles.appDialogImage} source={{ uri: icons[0] }} />
                        <TH1 style={commonStyles.textAlignCenter}>{name}</TH1>
                        <TP style={commonStyles.textAlignCenter}>Wants you to log in to their application here:</TP>
                        <TLink to={url}>{url}</TLink>
                    </View>
                </View>
            }
            footerHint={
                <View style={styles.infoBox}>
                    <TInfoBox
                        align="left"
                        icon="security"
                        description="100% secure. Only your phone can authorize your app login."
                        linkUrl={settings.config.links.securityLearnMore}
                        linkUrlText="Learn more"
                    />
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
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 60,
    },
    logo: {
        width: 100,
        height: 100,
    },
    imageStyle: {
        width: 10,
        height: 13,
    },
    networkHeading: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameText: {
        color: theme.colors.secondary2,
        marginLeft: 5,
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
        height: 40,
        resizeMode: 'contain',
    },
    marginTop: {
        marginTop: 30,
    },
    infoBox: {
        marginBottom: 32,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
