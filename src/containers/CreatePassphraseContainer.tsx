import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/CreatePassphraseScreen';
import PassphraseBox from '../components/PassphraseBox';
import usePassphraseStore from '../store/passphraseStore';
import { generatePrivateKeyFromPassword } from '../utils/keys';
import useUserStore from '../store/userStore';
import { ApplicationError, ApplicationErrors } from '../utils/errors';

export default function CreatePassphraseContainer({ navigation }: { navigation: Props['navigation'] }) {
    const { passphraseList, generatePassphraseList, getPassphrase } = usePassphraseStore();
    const { user } = useUserStore();
    const [loading, setLoading] = useState(false);
    const hasEffectRun = useRef(false);

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
    }, []);

    async function regenerate() {
        generatePassphraseList();
    }

    async function onNext() {
        setLoading(true);
        await user.savePassword(getPassphrase(), { keyFromPasswordFn: generatePrivateKeyFromPassword });
        setLoading(false);
        navigation.navigate('ConfirmPassphrase', { index: 0 });
    }

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={commonStyles.textAlignCenter}>Create passphrase</TH1>
                        <TP style={styles.paragraph}>
                            Passphrase is like a password but more secure and easier to remember.{' '}
                            <TP style={styles.link}>Learn more.</TP>
                        </TP>
                        <View style={styles.innerContainer}>
                            <View style={styles.columnContainer}>
                                {passphraseList.map((text, index) => (
                                    <PassphraseBox number={`${index + 1}.`} text={text} key={index} />
                                ))}
                            </View>
                        </View>
                        <View style={styles.btnView}>
                            <TButtonContained
                                style={styles.regenerateBtn}
                                onPress={regenerate}
                                icon={require('../assets/images/refresh-ccw.png')}
                                disabled={loading}
                            >
                                Regenerate
                            </TButtonContained>
                        </View>
                    </View>
                }
                footerHint={
                    <View>
                        <TInfoBox
                            align="left"
                            icon="security"
                            description="Your passphrase and private keys are self-sovereign meaning hackers have a very  hard time! "
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>
                }
                footer={
                    <View style={styles.createAccountMargin}>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained onPress={onNext}>NEXT</TButtonContained>
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
