import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import theme, { commonStyles } from '../utils/theme';
import { Props } from '../screens/WalletConnectLoginScreen';
import useErrorStore from '../store/errorStore';
import { ILoginRequest } from '../utils/chain/types';
import TInfoModalBox from '../components/TInfoModalBox';

export default function WalletConnectLoginContainer({
    navigation,
    loginRequest,
}: {
    navigation: Props['navigation'];
    loginRequest: ILoginRequest;
}) {
    const errorStore = useErrorStore();

    const onCancel = async () => {
        await loginRequest.reject();
        navigation.navigate('Assets');
    };

    const handleAccept = async () => {
        try {
            await loginRequest.approve();
            navigation.navigate('Assets');
        } catch (e) {
            await loginRequest.reject();
            navigation.navigate('Assets');

            errorStore.setError({ title: 'Error', error: e, expected: false });
        }
    };

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <View style={styles.marginTop}>
                        {loginRequest.account?.map((account, index) => {
                            const chain = account.getChain();
                            const chainName = chain.getName();
                            const accountName = account.getName();

                            return (
                                <View style={styles.networkHeading} key={index}>
                                    <Image source={require('../assets/icons/eth-img.png')} style={styles.imageStyle} />
                                    <Text style={styles.nameText}>{chainName} Network:</Text>
                                    {accountName && (
                                        <Text style={commonStyles.textAlignCenter}>
                                            {chain.formatShortAccountName(accountName)}
                                        </Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    <View style={[styles.appDialog, styles.marginTop]}>
                        <Image style={styles.appDialogImage} source={{ uri: loginRequest.loginApp.getLogoUrl() }} />
                        <TH1 style={commonStyles.textAlignCenter}>{loginRequest.loginApp.getName()}</TH1>
                        <TP style={commonStyles.textAlignCenter}>Wants you to log in to their application here:</TP>
                        <TLink to={loginRequest.loginApp.getUrl()}>{loginRequest.loginApp.getOrigin()}</TLink>
                    </View>
                </View>
            }
            footerHint={
                <View style={styles.infoBox}>
                    <TInfoModalBox
                        description="You’re in control — your data stays private unless you say otherwise"
                        modalTitle="You're in Control"
                        modalDescription="Your data stays private and secure on your device. It’s only shared with the services you choose — and only when you give permission. No one else can access it, not even us"
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
        color: theme.colors.grey9,
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
