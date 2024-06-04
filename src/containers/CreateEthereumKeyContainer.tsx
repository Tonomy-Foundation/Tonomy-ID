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
    TonomyContract,
    getAccountInfo,
    KeyManagerLevel,
    util,
} from '@tonomy/tonomy-id-sdk';
import { savePrivateKeyToStorage } from '../utils/keys';
import useErrorStore from '../store/errorStore';
import { DEFAULT_DEV_PASSPHRASE_LIST } from '../store/passphraseStore';
import PassphraseInput from '../components/PassphraseInput';
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
    const { requestEvent, requestSession } = route.params ?? {};

    const [passphrase, setPassphrase] = useState<string[]>(
        settings.isProduction() ? ['', '', '', '', '', ''] : DEFAULT_DEV_PASSPHRASE_LIST
    );
    const [nextDisabled, setNextDisabled] = useState(settings.isProduction() ? true : false);
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
                navigation.navigate('SignTransaction', { requestSession, requestEvent });
            } else {
                navigation.navigate({ name: 'UserHome', params: {} });
            }
        } catch (e) {
            console.log('error', e);

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

            setNextDisabled(true);
            setLoading(false);
        }
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
                            <PassphraseInput value={passphrase} onChange={setPassphrase} />
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
                    <View style={styles.createAccountMargin}>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained onPress={onNext} disabled={nextDisabled || loading}>
                                PROCEED
                            </TButtonContained>
                        </View>
                    </View>
                }
            />
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
        marginTop: 20,
        justifyContent: 'center',
    },
    createAccountMargin: {
        marginTop: 18,
    },
});
