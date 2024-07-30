import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Keyboard } from 'react-native';
import { TButtonContained } from '../components/atoms/TButton';
import { TH1 } from '../components/atoms/THeadings';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/CreateEthereumKeyScreen';
import useUserStore from '../store/userStore';
import { AccountType, SdkError, SdkErrors, TonomyUsername, TonomyContract, util } from '@tonomy/tonomy-id-sdk';
import { generatePrivateKeyFromPassword, savePrivateKeyToStorage } from '../utils/keys';
import useErrorStore from '../store/errorStore';
import { DEFAULT_DEV_PASSPHRASE_LIST } from '../store/passphraseStore';
import PassphraseInput from '../components/PassphraseInput';
import { keyStorage } from '../utils/StorageManager/setup';
import useWalletStore from '../store/useWalletStore';
import TModal from '../components/TModal';

const tonomyContract = TonomyContract.Instance;

export default function CreateEthereumKeyContainer({
    route,
    navigation,
}: {
    route: Props['route'];
    navigation: Props['navigation'];
}) {
    const errorsStore = useErrorStore();
    const { user } = useUserStore();
    const { transaction } = route.params ?? {};
    const session = route.params?.session;
    const initializeWallet = useWalletStore((state) => state.initializeWalletState);
    const [passphrase, setPassphrase] = useState<string[]>(
        settings.isProduction() ? ['', '', '', '', '', ''] : DEFAULT_DEV_PASSPHRASE_LIST
    );
    const [nextDisabled, setNextDisabled] = useState(settings.isProduction() ? true : false);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [showModal, setShowModal] = useState(false);

    async function setUserName() {
        try {
            const u = await user.getUsername();

            setUsername(u.getBaseUsername());
        } catch (e) {
            errorsStore.setError({ error: e, expected: false });
        }
    }

    useEffect(() => {
        setUserName();
    }, []);

    useEffect(() => {
        const isValid = passphrase.every(util.isKeyword);

        setNextDisabled(!isValid);
    }, [passphrase]);

    async function onNext() {
        setLoading(true);

        try {
            const tonomyUsername = TonomyUsername.fromUsername(
                username,
                AccountType.PERSON,
                settings.config.accountSuffix
            );

            const idData = await tonomyContract.getPerson(tonomyUsername);
            const salt = idData.password_salt;

            await user.login(tonomyUsername, passphrase.join(' '), {
                keyFromPasswordFn: generatePrivateKeyFromPassword,
            });

            await savePrivateKeyToStorage(passphrase.join(' '), salt.toString());

            setPassphrase(['', '', '', '', '', '']);
            setNextDisabled(false);
            setLoading(false);

            initializeWallet();
            setShowModal(true);
        } catch (e) {
            console.error('onNext()', e);

            if (e instanceof SdkError) {
                switch (e.code) {
                    case SdkErrors.PasswordInvalid:
                    case SdkErrors.PasswordFormatInvalid:
                    case SdkErrors.AccountDoesntExist:
                        errorsStore.setError({
                            error: new Error('Incorrect passphrase. Please try again.'),
                            expected: true,
                        });
                        break;
                    default:
                        errorsStore.setError({ error: e, expected: false });
                }
            } else {
                errorsStore.setError({ error: e, expected: false });
            }

            setNextDisabled(false);
            setLoading(false);
        }
    }

    const onModalPress = async () => {
        const key = await keyStorage.findByName('ethereum');

        setShowModal(false);

        if (session && key && transaction) {
            navigation.navigate('SignTransaction', {
                transaction,
                privateKey: key,
                session,
            });
        } else {
            navigation.navigate({ name: 'UserHome', params: {} });
        }
    };

    // Inside your component
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Enter your passphrase</TH1>
                        <Text style={styles.subHeading}>
                            We use your passphrase to generate a highly secure private key that’s gonna be used across
                            the devices
                        </Text>
                        <View style={styles.innerContainer}>
                            <PassphraseInput
                                value={passphrase}
                                onChange={setPassphrase}
                                setNextDisabled={setNextDisabled}
                            />
                        </View>
                    </View>
                }
                footerHint={
                    <View>
                        <TInfoBox
                            align="left"
                            icon="security"
                            description="Your password and private keys are self-sovereign meaning hackers have a very very hard time!"
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>
                }
                footer={
                    !isKeyboardVisible ? (
                        <View style={styles.createAccountMargin}>
                            <View style={commonStyles.marginBottom}>
                                <TButtonContained onPress={onNext} disabled={nextDisabled || loading}>
                                    PROCEED
                                </TButtonContained>
                            </View>
                        </View>
                    ) : undefined
                }
            />
            <TModal visible={showModal} icon="check" onPress={onModalPress}>
                <View style={{ marginTop: 10 }}>
                    <Text style={{ fontSize: 15, fontWeight: '500' }}>Your key successfully generated </Text>
                </View>
            </TModal>
        </>
    );
}

const styles = StyleSheet.create({
    subHeading: {
        textAlign: 'center',
        paddingHorizontal: 15,
        color: theme.colors.grey1,
        marginBottom: 20,
    },
    headline: {
        marginTop: -10,
        fontSize: 20,
        marginBottom: 5,
    },
    innerContainer: {
        marginTop: 10,
        justifyContent: 'center',
    },
    createAccountMargin: {
        marginTop: 18,
    },
});
