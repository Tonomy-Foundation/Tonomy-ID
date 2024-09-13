import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import TButton from './atoms/TButton';
import { formatCurrencyValue } from '../utils/numbers';
import theme from '../utils/theme';
import { MainScreenNavigationProp } from '../screens/MainScreen';
import { IAccount, IToken } from '../utils/chain/types';
import { progressiveRetryOnNetworkError } from '../utils/helper';
import { assetStorage } from '../utils/StorageManager/setup';
import Debug from 'debug';

const debug = Debug('tonomy-id:component:AcountSummary');

export type AccountSummaryProps = {
    navigation: MainScreenNavigationProp['navigation'];
    updateAccountDetail: (address: IAccount) => void;
    address: IAccount | null;
    networkName: string;
    token: IToken;
};

const AccountSummary = (props: AccountSummaryProps) => {
    const currentAddress = props.address?.getName();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [accountBalance, setAccountBalance] = useState<{ balance: string; usdBalance: number }>({
        balance: '0 ' + props.token.getSymbol(),
        usdBalance: 0,
    });

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                progressiveRetryOnNetworkError(async () => {
                    if (props.address) {
                        const accountToken = await props.address.getNativeToken();

                        setLogoUrl(accountToken.getLogoUrl());
                    }
                });
            } catch (e) {
                console.error('Failed to fetch logo', e);
            }
        };

        // const fetchBalance = async () => {
        //     if (props.token) {
        //         setLoading(true);
        //         const asset = await assetStorage.findAssetByName(props.token);

        //         if (asset) setAccountBalance({ balance: asset.balance, usdBalance: asset.usdBalance });

        //         setLoading(false);
        //     }
        // };

        fetchLogo();
        // fetchBalance();
    }, [props.address, props.token]);

    const generateKey = async () => {
        props.navigation.navigate('CreateEthereumKey');
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    if (props.address) {
                        props.updateAccountDetail(props.address);
                    }
                }}
            >
                <View style={[styles.appDialog, { justifyContent: 'center' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {logoUrl && (
                                    <Image
                                        source={{ uri: logoUrl }}
                                        style={[styles.favicon, { resizeMode: 'contain' }]}
                                    />
                                )}
                                <Text style={styles.networkTitle}>{props.networkName} Network:</Text>
                            </View>
                            {currentAddress ? (
                                <Text>
                                    {currentAddress.substring(0, 7)}....
                                    {currentAddress.substring(currentAddress.length - 6)}
                                </Text>
                            ) : (
                                <Text>Not connected</Text>
                            )}
                        </View>

                        {!currentAddress ? (
                            <TButton
                                style={styles.generateKey}
                                onPress={generateKey}
                                color={theme.colors.white}
                                size="medium"
                            >
                                Generate key
                            </TButton>
                        ) : (
                            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                {loading ? (
                                    <ActivityIndicator size="small" />
                                ) : (
                                    <>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text>{accountBalance.balance}</Text>
                                        </View>
                                        <Text style={styles.secondaryColor}>
                                            ${formatCurrencyValue(Number(accountBalance.usdBalance), 3)}
                                        </Text>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    appDialog: {
        backgroundColor: theme.colors.lightBg,
        borderStyle: 'solid',
        borderRadius: 7,
        padding: 10,
        width: '100%',
        marginTop: 5,
    },
    networkTitle: {
        color: theme.colors.secondary2,
        fontSize: 12,
    },
    favicon: {
        width: 13,
        height: 13,
        marginRight: 4,
    },
    generateKey: {
        width: '40%',
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
    },
    secondaryColor: {
        color: theme.colors.secondary2,
    },
});

export default AccountSummary;
