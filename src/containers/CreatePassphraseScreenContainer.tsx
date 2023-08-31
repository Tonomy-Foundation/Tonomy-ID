import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/CreatePassphraseScreen';
import PassphraseBox from '../components/PassphraseBox';

export default function CreatePassphraseScreenContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [phraseList, setPhraseList] = useState<string[]>(
        !settings.isProduction() ? ['barn', 'universe', 'plate', 'star', 'pretty', 'gold'] : ['', '', '', '', '', '']
    );

    async function onNext() {
        navigation.navigate('ConfirmPassphrase');
    }

    async function regenerate() {
        setPhraseList(['gold', 'barn', 'star', 'moon', 'sun', 'tree']);
    }

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Create passphrase</TH1>
                        <TP style={styles.paragraph}>
                            Passphrase is like a password but more secure and easier to remember.{' '}
                            <TP style={styles.link}>Learn more.</TP>
                        </TP>
                        <View style={styles.innerContainer}>
                            <View style={styles.columnContainer}>
                                {phraseList.map((text, index) => (
                                    <PassphraseBox number={`${index + 1}.`} text={text} key={index} />
                                ))}
                            </View>
                        </View>
                        <View style={styles.btnView}>
                            <TButtonContained
                                style={styles.regenerateBtn}
                                onPress={regenerate}
                                icon={require('../assets/images/refresh-ccw.png')}
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
    headline: {
        marginTop: -20,
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
