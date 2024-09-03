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
    updateAccountDetail: (address: IAccount, balance: { balance: string; usdBalance: number }) => void;
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
                        props.updateAccountDetail(props.address, props.accountBalance);
                    }
                }}
                style={styles.assetsView}
            >
                {logoUrl && <Image source={{ uri: logoUrl }} style={[styles.favicon, { resizeMode: 'contain' }]} />}
                <View style={styles.assetSummaryContent}>
                    <View style={styles.assetName}>
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
                        {props.address?.getChain().getChainId() === '11155111' && (
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
                    <View style={styles.flexColEnd}>
                        {currentAddress ? (
                            <View style={styles.flexColEnd}>
                                <View style={styles.assetBalance}>
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
                                    <Text style={styles.generateKeyText}>Generate key</Text>
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
    assetSummaryContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    assetName: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    flexColEnd: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    assetBalance: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    generateKeyText: {
        color: theme.colors.blue,
        fontSize: 13,
    },
});

export default AssetsSummary;
