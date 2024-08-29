import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SelectAssetScreenNavigationProp } from '../screens/SelectAsset';
import theme from '../utils/theme';

import { formatCurrencyValue } from '../utils/numbers';
import { USD_CONVERSION } from '../utils/chain/etherum';
import { useEffect, useState } from 'react';
import useUserStore from '../store/userStore';
import useWalletStore from '../store/useWalletStore';
import { CommunicationError, IdentifyMessage, VestingContract } from '@tonomy/tonomy-id-sdk';
import useErrorStore from '../store/errorStore';
import AssetItem from '../components/AssetItem';

const vestingContract = VestingContract.Instance;

const SelectAssetContainer = ({
    navigation,
    type,
    did,
}: {
    navigation: SelectAssetScreenNavigationProp['navigation'];
    type: string;
    did?: string;
}) => {
    const userStore = useUserStore();
    const user = userStore.user;
    const errorStore = useErrorStore();

    const [accountName, setAccountName] = useState('');
    const [pangeaBalance, setPangeaBalance] = useState(0);
    const [username, setUsername] = useState('');
    const [qrOpened, setQrOpened] = useState<boolean>(false);

    const { web3wallet, ethereumAccount, initialized, sepoliaAccount, polygonAccount, initializeWalletState } =
        useWalletStore();

    const { ethereumBalance, sepoliaBalance, polygonBalance, updateBalance } = useWalletStore((state) => ({
        ethereumBalance: state.ethereumBalance,
        sepoliaBalance: state.sepoliaBalance,
        polygonBalance: state.polygonBalance,
        updateBalance: state.updateBalance,
    }));

    useEffect(() => {
        async function getUpdatedBalance() {
            await updateBalance();

            const accountPangeaBalance = await vestingContract.getBalance(accountName);

            if (pangeaBalance !== accountPangeaBalance) {
                setPangeaBalance(accountPangeaBalance);
            }
        }

        getUpdatedBalance();

        const interval = setInterval(() => {
            getUpdatedBalance();
        }, 20000);

        return () => clearInterval(interval);
    }, [user, pangeaBalance, setPangeaBalance, accountName, updateBalance]);

    async function setUserName() {
        try {
            const u = await user.getUsername();

            setUsername(u.getBaseUsername());
            const accountName = (await user.getAccountName()).toString();

            setAccountName(accountName);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, []);

    async function onUrlOpen(did: string) {
        try {
            await connectToDid(did);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        } finally {
            onClose();
        }
    }
    async function connectToDid(did: string) {
        try {
            // Connect to the browser using their did:jwk
            const issuer = await user.getIssuer();
            const identifyMessage = await IdentifyMessage.signMessage({}, issuer, did);

            await user.sendMessage(identifyMessage);
        } catch (e) {
            if (
                e instanceof CommunicationError &&
                e.exception?.status === 400 &&
                e.exception.message.startsWith('Recipient not connected')
            ) {
                errorStore.setError({
                    title: 'Problem connecting',
                    error: new Error("We couldn't connect to the website. Please refresh the page or try again."),
                    expected: true,
                });
            } else {
                throw e;
            }
        }
    }
    function onClose() {
        setQrOpened(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <Text style={styles.screenTitle}>select a currency to {type}</Text>
                    <View style={{ marginTop: 20, flexDirection: 'column', gap: 20 }}>
                        <AssetItem
                            type={type}
                            navigation={navigation}
                            networkName="Pangea"
                            currency="LEOS"
                            leos
                            accountBalance={{
                                balance: pangeaBalance.toString(),
                                usdBalance: formatCurrencyValue(Number(pangeaBalance) * USD_CONVERSION),
                            }}
                            address={null}
                            accountName={accountName}
                        />
                        {ethereumAccount && (
                            <AssetItem
                                type={type}
                                navigation={navigation}
                                address={ethereumAccount}
                                accountBalance={ethereumBalance}
                                networkName="Ethereum"
                                currency="ETH"
                            />
                        )}
                        {sepoliaAccount && (
                            <AssetItem
                                type={type}
                                navigation={navigation}
                                address={sepoliaAccount}
                                accountBalance={sepoliaBalance}
                                networkName="Sepolia"
                                currency="SepoliaETH"
                            />
                        )}
                        {sepoliaAccount && (
                            <AssetItem
                                type={type}
                                navigation={navigation}
                                address={polygonAccount}
                                accountBalance={polygonBalance}
                                networkName="Polygon"
                                currency="MATIC"
                            />
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    content: {
        flex: 1,
        marginTop: 10,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    screenTitle: {
        textTransform: 'uppercase',
        color: theme.colors.tabGray,
        fontSize: 12,
        letterSpacing: 0.16,
        fontWeight: '500',
    },
    assetsView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    favicon: {
        width: 20,
        height: 20,
        marginRight: 4,
    },
    assetsNetwork: {
        backgroundColor: theme.colors.grey7,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 4,
    },
    secondaryColor: {
        fontSize: 13,
        color: theme.colors.secondary2,
    },
});
export default SelectAssetContainer;
