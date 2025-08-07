import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import AutoCompletePassphraseWord from '../components/AutoCompletePassphraseWord';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/ConfirmPassphraseScreen';
import theme, { commonStyles } from '../utils/theme';
import { numberToOrdinal } from '../utils/numbers';
import { TButtonContained } from '../components/atoms/TButton';
import { TH1, TP } from '../components/atoms/THeadings';
import usePassphraseStore from '../store/passphraseStore';
import settings from '../settings';
import TInfoModalBox from '../components/TInfoModalBox';

export default function ConfirmPassphraseWordContainer({
    route,
    navigation,
}: {
    route: Props['route'];
    navigation: Props['navigation'];
}) {
    const { index } = route.params;
    const { passphraseList, checkWordAtIndex, randomWordIndexes, setConfirmPassphraseWord, confirmPassphraseWords } =
        usePassphraseStore();
    const [value, setValue] = useState<string>(
        settings.isProduction() ? confirmPassphraseWords[index] : passphraseList[randomWordIndexes[index]]
    );
    const [errorMsg, setErrorMsg] = useState<string>('');

    const onNext = () => {
        if (value && !checkWordAtIndex(randomWordIndexes[index], value)) {
            setErrorMsg('Incorrect word.Please try again.');
            return;
        }

        if (index < 2) {
            setConfirmPassphraseWord(index, value);
            navigation.push('ConfirmPassphrase', { index: index + 1 });
        } else {
            navigation.navigate('TermsAndCondition');
        }
    };

    const onChange = (text) => {
        setValue(text);
        setErrorMsg('');
    };
    const infoMessages = [
        {
            description: 'More secure than passwords and private keys',
            modalTitle: 'Stronger than passwords',
            modalDescription:
                'Your passphrase isn’t just a password — it’s your ultra-secure key to everything. Easier to remember than a (secure) password or a private key. It combines simple, human-friendly words with advanced cryptography to keep your identity safe without the complexity. No special characters. No reset links. Just pure, powerful protection — made for real life',
        },
        {
            description: 'Your passphrase is the key to recovering your account securely — only you have access to it',
            modalTitle: 'Only you hold the key',
            modalDescription:
                'Your passphrase is the only way to recover your account — and only you can access it. We don’t store it. We can’t reset it. And no one else can guess it. You’re fully in control of your identity, with zero dependencies. Lose it, and it’s gone. Keep it safe, and your account is yours — forever. No emails, no phone numbers, no recovery hacks. Just true, private security. As it should be',
        },
        {
            description:
                'Write your passphrase down and store it somewhere safe. Don’t share it — no one else can recover it for you',
            modalTitle: 'Keep it safe and private',
            modalDescription:
                'Your passphrase is the only way to recover your keys if you lose access. Store it offline in a secure place, like a password manager or a locked drawer. Never share it — if someone gets it, they can access your account',
        },
    ];

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={commonStyles.textAlignCenter}>Confirm passphrase</TH1>
                        <View style={{ marginTop: 5 }}>
                            <View style={styles.innerContainer}>
                                <TP style={styles.textStyle}>
                                    Please enter the{' '}
                                    <TP style={styles.boldText}>
                                        {numberToOrdinal(randomWordIndexes[index] + 1)} word
                                    </TP>{' '}
                                    in your passphrase.
                                </TP>
                                <AutoCompletePassphraseWord value={value} onChange={(text) => onChange(text)} />
                                <Text style={styles.errorMsg}>{errorMsg}</Text>
                            </View>
                        </View>
                    </View>
                }
                footerHint={
                    <View style={{ marginBottom: 16 }}>
                        <TInfoModalBox
                            description={infoMessages[index].description}
                            modalTitle={infoMessages[index].modalTitle}
                            modalDescription={infoMessages[index].modalDescription}
                        />
                    </View>
                }
                footer={
                    <View>
                        <TButtonContained size="large" onPress={onNext} disabled={!value || value === ''}>
                            Next
                        </TButtonContained>
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        marginTop: 70,
        justifyContent: 'center',
    },
    textStyle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: theme.colors.text,
    },
    boldText: {
        fontWeight: 'bold',
    },
    errorMsg: {
        color: theme.colors.error,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 16,
        marginTop: 5,
    },
});
