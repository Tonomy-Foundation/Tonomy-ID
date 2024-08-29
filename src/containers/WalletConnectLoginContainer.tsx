import React, { useEffect, useState } from 'react';
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
import { IChainSession, ChainDetail } from '../utils/chain/types';

export default function WalletConnectLoginContainer({
    navigation,
    payload,
    platform,
    session,
}: {
    navigation: Props['navigation'];
    payload: SignClientTypes.EventArguments['session_proposal'];
    platform: 'mobile' | 'browser';
    session: IChainSession;
}) {
    const { name, url, icons } = payload?.params?.proposer?.metadata ?? {};
    const parsedUrl = new URL(url);
    const errorStore = useErrorStore();
    const [accounts, setAccounts] = useState<ChainDetail[]>([]); // Replace `string[]` with the actual type if known

    useEffect(() => {
        const fetchActiveAccounts = async () => {
            try {
                const activeAccounts = await session.getActiveAccounts();

                setAccounts(activeAccounts);
            } catch (error) {
                console.error('Failed to fetch active accounts:', error);
            }
        };

        fetchActiveAccounts();
    }, []); // Add dependencies if needed

    const onCancel = async () => {
        await session.rejectRequest();
        navigation.navigate({
            name: 'UserHome',
            params: {},
        });
    };

    const handleAccept = async () => {
        try {
            await session.createSession();
            navigation.navigate({
                name: 'UserHome',
                params: {},
            });
        } catch (e) {
            await session.rejectRequest();

            navigation.navigate({
                name: 'UserHome',
                params: {},
            });
            errorStore.setError({ title: 'Error', error: e, expected: false });
        }
    };

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <View style={styles.marginTop}>
                        {accounts?.map(({ networkName, address }, index) => (
                            <View style={styles.networkHeading} key={index}>
                                <Image source={require('../assets/icons/eth-img.png')} style={styles.imageStyle} />
                                <Text style={styles.nameText}>{networkName} Network:</Text>
                                {address && (
                                    <Text style={commonStyles.textAlignCenter}>
                                        {address.substring(0, 9)}....
                                        {address.substring(address.length - 8)}
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
