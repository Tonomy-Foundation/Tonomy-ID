import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import TButton from './atoms/TButton';
import { formatCurrencyValue } from '../utils/numbers';
import theme from '../utils/theme';
import { AssetsScreenNavigationProp } from '../screens/Assets';
import { IAccount } from '../utils/chain/types';

export type AccountSummaryProps = {
    navigation: AssetsScreenNavigationProp['navigation'];
    accountBalance: { balance: string; usdBalance: number };
    updateAccountDetail: (address: IAccount) => void;
    address: IAccount | null;
    networkName: string;
    currency: string;
};

const AssetsSummary = (props: AccountSummaryProps) => {
    const currentAddress = props.address?.getName();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogo = async () => {
            if (props.address) {
                const accountToken = await props.address.getNativeToken();

                setLogoUrl(accountToken.getLogoUrl());
            }
        };

        fetchLogo();
    }, [props.address]);

    const getBalance = () => {
        return props.accountBalance.balance.replace(props.currency, '')?.trim();
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    if (props.address) {
                        props.updateAccountDetail(props.address);
                    }
                }}
                style={styles.assetsView}
            >
                {logoUrl && <Image source={{ uri: logoUrl }} style={[styles.favicon, { resizeMode: 'contain' }]} />}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        flex: 1,
                    }}
                >
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <Text style={{ fontSize: 16 }}>{props.currency}</Text>
                        <View style={styles.assetsNetwork}>
                            <Text
                                style={{
                                    fontSize: 10,
                                }}
                            >
                                {props.networkName}
                            </Text>
                        </View>
                        {props.address?.getChain().getChainId() !== '1' && (
                            <View style={styles.assetsTestnetNetwork}>
                                <Text
                                    style={{
                                        fontSize: 10,
                                        color: theme.colors.white,
                                    }}
                                >
                                    Testnet
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        {currentAddress ? (
                            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16 }}>{getBalance()}</Text>
                                </View>
                                <Text style={styles.secondaryColor}>
                                    ${formatCurrencyValue(Number(props.accountBalance.usdBalance), 3)}
                                </Text>
                            </View>
                        ) : (
                            <View>
                                <TouchableOpacity onPress={() => props.navigation.navigate('CreateEthereumKey')}>
                                    <Text style={{ fontSize: 16 }}>Not connected</Text>
                                    <Text style={{ color: theme.colors.blue, fontSize: 13 }}>Generate key</Text>
                                </TouchableOpacity>
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
        width: 28,
        height: 28,
        marginRight: 4,
    },
    generateKey: {
        width: '40%',
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
    },
    secondaryColor: {
        color: theme.colors.secondary2,
        fontSize: 13,
    },
    assetsView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 8,
        padding: 16,
    },
    assetsNetwork: {
        backgroundColor: theme.colors.grey7,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    assetsTestnetNetwork: {
        backgroundColor: theme.colors.blue,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
});

export default AssetsSummary;
