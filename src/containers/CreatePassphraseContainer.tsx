import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TButtonContained, TButtonOutlined, TButtonSecondaryContained } from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/CreatePassphraseScreen';
import PassphraseBox from '../components/PassphraseBox';
import usePassphraseStore from '../store/passphraseStore';
import { generatePrivateKeyFromPassword, savePrivateKeyToStorage } from '../utils/keys';
import useUserStore from '../store/userStore';
import { ApplicationError, ApplicationErrors } from '../utils/errors';
import { Checksum256, PrivateKey } from '@wharfkit/antelope';
import useErrorStore from '../store/errorStore';
import TSpinner from '../components/atoms/TSpinner';
import TInfoModalBox from '../components/TInfoModalBox';

export interface ILoginOptions {
    keyFromPasswordFn: KeyFromPasswordFn;
}

type KeyFromPasswordFn = (
    password: string,
    salt?: Checksum256
) => Promise<{ privateKey: PrivateKey; salt: Checksum256 }>;

export default function CreatePassphraseContainer({ navigation }: { navigation: Props['navigation'] }) {
    const { passphraseList, generatePassphraseList, getPassphrase } = usePassphraseStore();
    const { user } = useUserStore();
    const [loading, setLoading] = useState(false);
    const hasEffectRun = useRef(false);
    const errorsStore = useErrorStore();

    useEffect(() => {
        if (!hasEffectRun.current) {
            try {
                if (passphraseList?.length <= 0) {
                    generatePassphraseList();
                }

                getPassphrase();
            } catch (e) {
                if (e instanceof ApplicationError && e.code === ApplicationErrors.NoDataFound) {
                    generatePassphraseList();
                }
            }

            hasEffectRun.current = true;
        }
    }, [generatePassphraseList, getPassphrase, passphraseList?.length]);

    async function regenerate() {
        generatePassphraseList();
    }

    async function onNext() {
        setLoading(true);

        try {
            const passphrase = getPassphrase();
            const { privateKey, salt } = await generatePrivateKeyFromPassword(passphrase);

            const loginOptions: ILoginOptions = {
                keyFromPasswordFn: async () => ({ privateKey, salt }),
            };

            await user.savePassword(passphrase, loginOptions);
            await savePrivateKeyToStorage(passphrase, salt.toString());

            navigation.navigate('ConfirmPassphrase', { index: 0 });
        } catch (e) {
            errorsStore.setError({ error: e, expected: false });
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={commonStyles.textAlignCenter}>Create passphrase</TH1>
                        <TP style={styles.paragraph}>
                            Passphrase is like a password but more secure and easier to remember.{' '}
                            {/* TODO: uncomment link */}
                            {/* <TP style={styles.link}>Learn more.</TP> */}
                        </TP>
                        <View style={styles.innerContainer}>
                            <View style={styles.columnContainer}>
                                {passphraseList.map((text, index) => (
                                    <PassphraseBox number={`${index + 1}.`} text={text} key={index} />
                                ))}
                                {passphraseList.map((text, index) => (
                                    <PassphraseBox number={`${index + 1}.`} text={text} key={index} />
                                ))}
                                {passphraseList.map((text, index) => (
                                    <PassphraseBox number={`${index + 1}.`} text={text} key={index} />
                                ))}
                            </View>
                        </View>
                        <View style={styles.btnView}>
                            <TButtonSecondaryContained
                                style={styles.regenerateBtn}
                                onPress={regenerate}
                                icon={require('../assets/images/refresh-ccw.png')}
                                disabled={loading}
                            >
                                Regenerate
                            </TButtonSecondaryContained>
                        </View>
                    </View>
                }
                footerHint={
                    <View>
                        <TInfoModalBox
                            description="Pick a fun 6-word passphrase to keep your keys safe! "
                            modalTitle="Create Your 6-Word Passphrase"
                            modalDescription=" Choose a fun and memorable 6-word passphrase — this will help protect your keys and recover your account if you ever lose access. It’s like a safety net only you control, so make it something unique and store it somewhere safe. No one else can recreate or retrieve it for you"
                        />
                    </View>
                }
                footer={
                    <View style={styles.createAccountMargin}>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained
                                loading={loading}
                                disabled={loading}
                                style={{ width: '100%' }}
                                size="large"
                                onPress={onNext}
                            >
                                NEXT
                            </TButtonContained>
                        </View>
                        <View style={styles.textContainer}>
                            <TP size={1}>Already have an account? </TP>
                            <TouchableOpacity onPress={() => navigation.navigate('LoginUsername')}>
                                <TP size={1} style={styles.link}>
                                    Login
                                </TP>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}

const styles = StyleSheet.create({
    paragraph: {
        textAlign: 'center',
        fontSize: 14,
    },
    innerContainer: {
        marginTop: 10,
        justifyContent: 'center',
    },
    createAccountMargin: {
        marginTop: 18,
    },
    link: {
        color: theme.colors.linkColor,
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
