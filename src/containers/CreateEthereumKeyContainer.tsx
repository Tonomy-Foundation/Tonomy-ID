import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TButtonContained } from '../components/atoms/TButton';
import { TH1 } from '../components/atoms/THeadings';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/CreateEthereumKeyScreen';
import useUserStore from '../store/userStore';
import {
    AccountType,
    SdkError,
    SdkErrors,
    TonomyUsername,
    util,
    TonomyContract,
    getAccountInfo,
    KeyManagerLevel,
} from '@tonomy/tonomy-id-sdk';
import { savePrivateKeyToStorage } from '../utils/keys';
import useErrorStore from '../store/errorStore';
import { DEFAULT_DEV_PASSPHRASE_LIST } from '../store/passphraseStore';
import AutoCompletePassphraseWord from '../components/AutoCompletePassphraseWord';
import RNKeyManager from '../utils/RNKeyManager';

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
    const { requestEvent, requestSession } = route.params;

    const [passphrase, setPassphrase] = useState<string[]>(
        settings.isProduction() ? ['', '', '', '', '', ''] : DEFAULT_DEV_PASSPHRASE_LIST
    );
    const [nextDisabled, setNextDisabled] = useState(settings.isProduction() ? true : false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');

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

            await savePrivateKeyToStorage(passphrase.join(' '), salt.toString());

            const accountData = await getAccountInfo(idData.account_name);

            const onchainKey = accountData.getPermission('owner').required_auth.keys[0].key; 
            const rnKeyManager = new RNKeyManager();
            const publicKey = await rnKeyManager.getKey({
                level: KeyManagerLevel.PASSWORD,
            });

            if (publicKey.toString() !== onchainKey.toString())
                throw new Error(`Password is incorrect ${SdkErrors.PasswordInvalid}`);

            setPassphrase(['', '', '', '', '', '']);
            setNextDisabled(false);
            setLoading(false);

            if (requestEvent && requestSession) {
                navigation.navigate('SignTransaction', {
                    requestSession,
                    requestEvent,
                });
            } else {
                navigation.navigate({
                    name: 'UserHome',
                    params: {},
                });
            }
        } catch (e) {
            console.log('error', e);

            if (e instanceof SdkError) {
                switch (e.code) {
                    case SdkErrors.PasswordInvalid:
                    case SdkErrors.PasswordFormatInvalid:
                    case SdkErrors.AccountDoesntExist:
                        setErrorMessage('Incorrect passphrase. Please try again.');
                        break;
                    default:
                        setErrorMessage('');
                        errorsStore.setError({ error: e, expected: false });
                }

                setNextDisabled(true);
                setLoading(false);
                return;
            } else {
                errorsStore.setError({ error: e, expected: false });
                setNextDisabled(true);
                setLoading(false);
                return;
            }
        }
    }

    async function onChangeWord(index: number, word: string) {
        setErrorMessage('');

        setPassphrase((prev) => {
            const newPassphrase = [...prev];

            newPassphrase[index] = word;
            setNextDisabled(false);

            for (let i = 0; i < newPassphrase.length; i++) {
                if (!util.isKeyword(newPassphrase[i])) {
                    setNextDisabled(true);
                }
            }

            return newPassphrase;
        });
    }

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
                            <View style={styles.columnContainer}>
                                {passphrase.map((text, index) => (
                                    <View key={index} style={styles.autoCompleteViewContainer}>
                                        <Text style={styles.autoCompleteNumber}>{index + 1}.</Text>
                                        <AutoCompletePassphraseWord
                                            textInputStyle={styles.autoCompleteTextInput}
                                            containerStyle={styles.autoCompleteContainer}
                                            value={text}
                                            onChange={(text) => onChangeWord(index, text)}
                                            menuStyle={index < 2 ? styles.menuViewBottom : styles.menuViewTop}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                    </View>
                }
                footerHint={
                    <View>
                        <TInfoBox
                            align="left"
                            icon="security"
                            description="Your password and private keys are self-sovereign meaning hackers have a very very hard time! "
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>
                }
                footer={
                    <View style={styles.createAccountMargin}>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained onPress={onNext} disabled={nextDisabled || loading}>
                                PROCEED
                            </TButtonContained>
                        </View>
                    </View>
                }
            ></LayoutComponent>
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
    errorText: {
        ...commonStyles.textAlignCenter,
        color: theme.colors.error,
    },
    menuViewTop: {
        bottom: 47,
    },
    menuViewBottom: {
        top: 47,
    },
    autoCompleteViewContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginRight: 15,
        marginBottom: 10,
        // position: 'relative',
    },
    autoCompleteContainer: {
        width: 120,
        marginTop: 22,
        justifyContent: 'flex-start',
        position: 'relative',
    },
    autoCompleteNumber: {
        marginRight: -15,
        marginLeft: 10,
        zIndex: -1,
    },
    autoCompleteTextInput: {
        width: 120,
        height: 42,
        marginTop: 22,
        justifyContent: 'center',
    },
    headline: {
        marginTop: -10,
        fontSize: 20,
        marginBottom: 5,
    },
    paragraph: {
        textAlign: 'center',
        fontSize: 14,
    },
    innerContainer: {
        marginTop: 20,
        justifyContent: 'center',
    },
    createAccountMargin: {
        marginTop: 18,
    },
    link: {
        color: theme.colors.primary,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    columnContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    btnView: {
        textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    regenerateBtn: {
        width: '50%',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});
