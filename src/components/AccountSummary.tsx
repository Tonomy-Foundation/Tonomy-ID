import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import TButton from './atoms/TButton';
import { formatCurrencyValue } from '../utils/numbers';
import theme from '../utils/theme';
import { MainScreenNavigationProp } from '../screens/MainScreen';
import AccountDetails from './AccountDetails';

interface AccountDetails {
    symbol: string;
    image?: string;
    name: string;
    address: string;
    icon?: ImageSourcePropType | undefined;
}

export type AccountSummaryProps = {
    navigation: MainScreenNavigationProp['navigation'];
    accountBalance: { balance: string; usdValue: number };
    handleModalOpen: () => void;
    accountDetails: AccountDetails;
};

const AccountSummary = (props: AccountSummaryProps) => {
    const currentAddress = props.accountDetails.address;

    return (
        <>
            <TouchableOpacity onPress={props.handleModalOpen}>
                <View style={[styles.appDialog, { justifyContent: 'center' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={require('../assets/icons/eth-img.png')} style={styles.favicon} />
                                <Text style={styles.networkTitle}>{props.accountDetails.name} Network:</Text>
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
    requestView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    requestText: {
        paddingHorizontal: 30,
        marginHorizontal: 10,
        paddingVertical: 30,
        marginTop: 10,
        textAlign: 'center',
    },
    image: {
        width: 200,
        height: 190,
        resizeMode: 'contain',
        marginTop: 20,
        marginBottom: 20,
    },
    container: {
        padding: 16,
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    button: {
        width: '50%',
    },
    accountHead: {
        fontSize: 16,
        marginBottom: 4,
        fontWeight: '600',
    },
    cards: {
        flex: 1,
    },
    scrollView: {
        marginRight: -20,
    },
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
    secondaryColor: {
        color: theme.colors.secondary2,
    },
    favicon: {
        width: 13,
        height: 13,
        marginRight: 4,
    },
    accountsView: {
        marginTop: 25,
        paddingHorizontal: 5,
    },
    balanceView: {
        marginTop: 7,
    },
    marginTop: {
        marginTop: 28,
    },
    generateKey: {
        width: '40%',
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
    },
});

export default AccountSummary;
