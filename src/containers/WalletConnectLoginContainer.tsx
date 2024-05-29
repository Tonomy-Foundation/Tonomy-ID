import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import TInfoBox from '../components/TInfoBox';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import theme, { commonStyles } from '../utils/theme';
import settings from '../settings';
import { SignClientTypes } from '@walletconnect/types';
import { currentETHAddress, _pair } from '../services/WalletConnect/WalletConnectModule';
import { EthereumChainSession, EthereumSepoliaChain } from '../utils/chain/etherum';
import { Props } from '../screens/WalletConnectLoginScreen';

export default function WalletConnectLoginContainer({
    navigation,
    payload,
    platform,
}: {
    navigation: Props['navigation'];
    payload: SignClientTypes.EventArguments['session_proposal'];
    platform: 'mobile' | 'browser';
}) {
    const { name, url, icons } = payload?.params?.proposer?.metadata ?? {};
    const parsedUrl = new URL(url);
    const session = new EthereumChainSession(payload, EthereumSepoliaChain);

    const onCancel = async () => {
        await session.rejectSession();
        navigation.navigate({
            name: 'UserHome',
            params: {},
        });
    };

    const handleAccept = async () => {
        try {
            await session.acceptSession();
            navigation.navigate({
                name: 'UserHome',
                params: {},
            });
        } catch (e) {
            await session.rejectSession();
            navigation.navigate({
                name: 'UserHome',
                params: {},
            });
        }
    };

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
                        <TLink to={url}>{parsedUrl.origin}</TLink>
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
