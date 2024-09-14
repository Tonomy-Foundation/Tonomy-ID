import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { EthereumChain } from '../utils/chain/etherum';
import { IToken } from '../utils/chain/types';
import TSpinner from '../components/atoms/TSpinner';
import TButton from './atoms/TButton';
import { formatCurrencyValue } from '../utils/numbers';
import theme from '../utils/theme';
import Debug from 'debug';

const debug = Debug('tonomy-id:component:AccountSummary');

interface Chain {
    name: string;
    token: IToken;
    chain: EthereumChain;
}

export type AccountSummaryProps = {
    chains: Chain[];
    refreshBalance: boolean;
    findAccountByChain: (chainName: string) => { account: string | null; balance: string; usdBalance: number };
    openAccountDetails: (chain: Chain) => void;
};

const AccountSummary = (props: AccountSummaryProps) => {
    return (
        <View>
            {props.chains.map((chain, index) => {
                const accountData = props.findAccountByChain(chain.name);

                return (
                    <TouchableOpacity key={index} onPress={() => props.openAccountDetails(chain)}>
                        <View style={[styles.appDialog, { justifyContent: 'center' }]}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image
                                            source={{ uri: chain.token.getLogoUrl() }}
                                            style={[styles.favicon, { resizeMode: 'contain' }]}
                                        />
                                        <Text style={styles.networkTitle}>{chain.name} Network:</Text>
                                    </View>
                                    {accountData.account ? (
                                        <Text>
                                            {accountData.account.substring(0, 7)}....
                                            {accountData.account.substring(accountData.account.length - 6)}
                                        </Text>
                                    ) : (
                                        <Text>Not connected</Text>
                                    )}
                                </View>
                                {props.refreshBalance ? (
                                    <TSpinner size={'small'} />
                                ) : (
                                    <>
                                        {!accountData.account ? (
                                            <TButton
                                                style={styles.generateKey}
                                                onPress={() => {
                                                    debug('Generate key clicked');
                                                }}
                                                color={theme.colors.white}
                                                size="medium"
                                            >
                                                Generate key
                                            </TButton>
                                        ) : (
                                            <>
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-end',
                                                    }}
                                                >
                                                    <>
                                                        <View
                                                            style={{
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <Text>{accountData.balance}</Text>
                                                        </View>
                                                        <Text style={styles.secondaryColor}>
                                                            ${formatCurrencyValue(Number(accountData.usdBalance), 3)}
                                                        </Text>
                                                    </>
                                                </View>
                                            </>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
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
    secondaryColor: {
        color: theme.colors.secondary2,
    },
    favicon: {
        width: 13,
        height: 13,
        marginRight: 4,
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
