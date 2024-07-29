import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import TInfoBox from '../components/TInfoBox';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import theme, { commonStyles } from '../utils/theme';
import settings from '../settings';
import { EthereumChainSession, EthereumSepoliaChain } from '../utils/chain/etherum';
import { Props } from '../screens/WalletConnectLoginScreen';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import useWalletStore from '../store/useWalletStore';
import { getSdkError } from '@walletconnect/utils';
import useErrorStore from '../store/errorStore';

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
    const { web3wallet, ethereumAccount, sepoliaAccount, polygonAccount } = useWalletStore();
    const errorStore = useErrorStore();

    const { requiredNamespaces, optionalNamespaces } = payload.params;
    const activeNamespaces = Object.keys(requiredNamespaces).length === 0 ? optionalNamespaces : requiredNamespaces;
    const chains = activeNamespaces.eip155.chains;
    const chainIds = chains?.map((chain) => chain.split(':')[1]);
    const chainDetails = chainIds?.map((chainId) => {
        let currentETHAddress;
        let networkName;

        if (chainId === '11155111') {
            currentETHAddress = sepoliaAccount ? sepoliaAccount.getName() : '';
            networkName = 'Sepolia';
        } else if (chainId === '1') {
            currentETHAddress = ethereumAccount ? ethereumAccount.getName() : '';
            networkName = 'Ethereum';
        } else if (chainId === '137') {
            currentETHAddress = polygonAccount ? polygonAccount.getName() : '';
            networkName = 'Polygon';
        } else {
            errorStore.setError({
                title: 'Unsupported',
                error: new Error('This chain not supported.'),
                expected: true,
            });
        }

        return { chainId, currentETHAddress, networkName };
    });

    const onCancel = async () => {
        await web3wallet?.rejectSession({
            id: payload.id,
            reason: getSdkError('USER_REJECTED'),
        });
        navigation.navigate({
            name: 'UserHome',
            params: {},
        });
    };

    const handleAccept = async () => {
        try {
            const namespaces: SessionTypes.Namespaces = {};

            Object.keys(activeNamespaces).forEach((key) => {
                const accounts: string[] = [];

                activeNamespaces[key].chains?.forEach((chain) => {
                    const chainId = chain.split(':')[1];
                    const chainDetail = chainDetails?.find((detail) => detail.chainId === chainId);

                    if (chainDetail?.currentETHAddress) {
                        accounts.push(`${chain}:${chainDetail.currentETHAddress}`);
                    }
                });
                namespaces[key] = {
                    chains: activeNamespaces[key].chains,
                    accounts,
                    methods: activeNamespaces[key].methods,
                    events: activeNamespaces[key].events,
                };
            });

            await web3wallet?.approveSession({
                id: payload.id,
                relayProtocol: payload.params.relays[0].protocol,
                namespaces,
            });
            navigation.navigate({
                name: 'UserHome',
                params: {},
            });
        } catch (e) {
            alert(e);
            await web3wallet?.rejectSession({
                id: payload.id,
                reason: getSdkError('USER_REJECTED'),
            });
            navigation.navigate({
                name: 'UserHome',
                params: {},
            });
            errorStore.setError({ error: e, expected: false });
        }
    };

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <View style={styles.marginTop}>
                        {chainDetails?.map(({ networkName, currentETHAddress }, index) => (
                            <View style={styles.networkHeading} key={index}>
                                <Image source={require('../assets/icons/eth-img.png')} style={styles.imageStyle} />
                                <Text style={styles.nameText}>{networkName} Network:</Text>
                                {currentETHAddress && (
                                    <Text style={commonStyles.textAlignCenter}>
                                        {currentETHAddress.substring(0, 9)}....
                                        {currentETHAddress.substring(currentETHAddress.length - 8)}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>

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
                    <TButtonContained style={commonStyles.marginBottom} onPress={handleAccept}>
                        Login
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
        marginBottom: 10,
    },
    nameText: {
        color: theme.colors.secondary2,
        marginLeft: 10,
        marginRight: 10,
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
        marginTop: 20,
    },
    infoBox: {
        marginBottom: 32,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
