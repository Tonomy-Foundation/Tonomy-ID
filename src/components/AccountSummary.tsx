import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import TButton from './atoms/TButton';
import { formatCurrencyValue } from '../utils/numbers';
import theme from '../utils/theme';
import { MainScreenNavigationProp } from '../screens/MainScreen';
import { IAccount } from '../utils/chain/types';
import NetInfo from '@react-native-community/netinfo';
import useErrorStore from '../store/errorStore';

export type AccountSummaryProps = {
    navigation: MainScreenNavigationProp['navigation'];
    accountBalance: { balance: string; usdBalance: number };
    updateAccountDetail: (address: IAccount) => void;
    address: IAccount | null;
    networkName: string;
};

const AccountSummary = (props: AccountSummaryProps) => {
    const currentAddress = props.address?.getName();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const errorStore = useErrorStore();

    useEffect(() => {
        const fetchLogo = async () => {
            if (props.address) {
                const accountToken = await props.address.getNativeToken();

                setLogoUrl(accountToken.getLogoUrl());
            }
        };

        fetchLogo();
    }, [props.address]);

    const generateKey = async () => {
        const state = await NetInfo.fetch();

        if (state.isConnected) {
            props.navigation.navigate('CreateEthereumKey');
        } else {
            errorStore.setError({
                error: new Error('Please connect to the internet to generate a key'),
                title: 'No internet connection',
                expected: true,
            });
        }
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
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text>{props.accountBalance.balance}</Text>
                                </View>
                                <Text style={styles.secondaryColor}>
                                    ${formatCurrencyValue(Number(props.accountBalance.usdBalance), 3)}
                                </Text>
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
