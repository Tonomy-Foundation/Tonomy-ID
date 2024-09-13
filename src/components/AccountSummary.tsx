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
import { EthereumAccount, EthereumChain } from '../utils/chain/etherum';

const debug = Debug('tonomy-id:component:AcountSummary');

export type AccountSummaryProps = {
    navigation: MainScreenNavigationProp['navigation'];
    updateAccountDetail: (address: IAccount) => void;
    networkName: string;
    token: IToken;
    chain: EthereumChain;
};

const AccountSummary = (props: AccountSummaryProps) => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [account, setAccount] = useState<{ name: string | null; balance: string; usdBalance: number }>({
        name: null,
        balance: '0 ' + props?.token?.getSymbol() || '',
        usdBalance: 0,
    });

    debug(account, 'Account summary');
    useEffect(() => {
        const fetchLogo = async () => {
            try {
                progressiveRetryOnNetworkError(async () => {
                    if (account.name) {
                        const accountName = new EthereumAccount(props.chain, account.name);
                        const accountToken = await accountName.getNativeToken();

                        if (accountToken && accountToken.getLogoUrl) {
                            setLogoUrl(accountToken.getLogoUrl());
                        }
                    }
                }).catch((error) => {
                    if (error.message === 'Network request failed') {
                        debug('Network error when fetching logo. Retrying...', error);
                    } else {
                        debug('recursive eroor', error);
                    }
                });
            } catch (e) {
                if (e.message === 'Network Request Failed') {
                    return;
                } else console.error('Failed to fetch logo', e);
            }
        };

        const fetchAccountAndBalance = async () => {
            if (props.token) {
                setLoading(true);
                const asset = await assetStorage.findAssetByName(props.token);

                if (asset) {
                    if (!account.name) {
                        setAccount({ name: asset.accountName, balance: asset.balance, usdBalance: asset.usdBalance });
                    } else {
                        setAccount((prevAccount) => ({
                            ...prevAccount,
                            balance: asset.balance,
                            usdBalance: asset.usdBalance,
                        }));
                    }
                }

                setLoading(false);
            }
        };

        fetchAccountAndBalance();

        fetchLogo();
    }, [props.chain, props.token, account.name]);

    const generateKey = async () => {
        if (props.navigation) {
            props.navigation.navigate('CreateEthereumKey');
        }
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    if (account.name) {
                        const accountName = new EthereumAccount(props.chain, account.name);

                        props.updateAccountDetail(accountName);
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
                            {account.name ? (
                                <Text>
                                    {account.name.substring(0, 7)}....
                                    {account.name.substring(account.name.length - 6)}
                                </Text>
                            ) : (
                                <Text>Not connected</Text>
                            )}
                        </View>

                        {!account.name ? (
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
                                            <Text>{account.balance}</Text>
                                        </View>
                                        <Text style={styles.secondaryColor}>
                                            ${formatCurrencyValue(Number(account.usdBalance), 3)}
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
