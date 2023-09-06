import React from 'react';
import { StyleSheet, View } from 'react-native';
import Autocomplete from '../components/AutoComplete';
import LayoutComponent from '../components/layout';
import { Props } from '../screens/ConfirmThirdPassphraseScreen';
import theme, { commonStyles } from '../utils/theme';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import usePassphraseStore from '../store/passphraseStore';
import { generatePrivateKeyFromPassword } from '../utils/keys';
import useErrorStore from '../store/errorStore';
import useUserStore from '../store/userStore';

export default function ConfirmThirdPassphraseContainer({ navigation }: { navigation: Props['navigation'] }) {
    const userStore = useUserStore();
    const user = userStore.user;
    const errorStore = useErrorStore();

    const { setThirdWord, thirdWord, checkWordAtIndex, randomNumbers, passphraseList } = usePassphraseStore();
    const thirdIndex = randomNumbers[2];

    const onNext = async () => {
        try {
            // const passphrase = passphraseList.join(' ');

            // await user.savePassword(passphrase, { keyFromPasswordFn: generatePrivateKeyFromPassword });

            navigation.navigate('Hcaptcha');
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
            return;
        }
    };

    return (
        <>
            <LayoutComponent
                body={
                    <View>
                        <TH1 style={[styles.headline, commonStyles.textAlignCenter]}>Confirm passphrase</TH1>
                        <View style={{ marginTop: 60 }}>
                            <View style={styles.innerContainer}>
                                <TP style={styles.textStyle}>
                                    Please enter the <TP style={styles.boldText}>{thirdIndex + 1} word</TP> in your
                                    passphrase.
                                </TP>
                                <Autocomplete
                                    label=""
                                    value={thirdWord}
                                    setPassphraseValue={setThirdWord}
                                    index={thirdIndex}
                                />
                            </View>
                        </View>
                    </View>
                }
                footer={
                    <View>
                        <View style={commonStyles.marginBottom}>
                            <TButtonContained disabled={!checkWordAtIndex(thirdIndex, thirdWord)} onPress={onNext}>
                                {' '}
                                NEXT
                            </TButtonContained>
                        </View>
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}

const styles = StyleSheet.create({
    headline: {
        marginTop: -10,
        fontSize: 20,
        marginBottom: 5,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        marginTop: 50,
        justifyContent: 'center',
    },
    textStyle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: theme.colors.grey1,
    },
    boldText: {
        fontWeight: 'bold',
    },
});
