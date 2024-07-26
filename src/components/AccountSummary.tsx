import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import TButton from './atoms/TButton';
import { formatCurrencyValue } from '../utils/numbers';
import theme from '../utils/theme';
import { MainScreenNavigationProp } from '../screens/MainScreen';
import { IAccount } from '../utils/chain/types';

export type AccountSummaryProps = {
    navigation: MainScreenNavigationProp['navigation'];
    accountBalance: { balance: string; usdValue: number };
    updateAccountDetail: (address: IAccount) => void;
    address: IAccount | null;
    networkName: string;
};

const AccountSummary = (props: AccountSummaryProps) => {
    const currentAddress = props.address?.getName();

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
                                <Image source={require('../assets/icons/eth-img.png')} style={styles.favicon} />
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
                                onPress={() => props.navigation.navigate('CreateEthereumKey')}
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
                                    ${formatCurrencyValue(Number(props.accountBalance.usdValue), 3)}
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
