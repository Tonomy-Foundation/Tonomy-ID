import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TCaption, TH1, TP } from '../components/atoms/THeadings';
import settings from '../settings';
import useUserStore from '../store/userStore';
import { randomString, SdkError, SdkErrors } from '@tonomy/tonomy-id-sdk';
import TInfoBox from '../components/TInfoBox';
import LayoutComponent from '../components/layout';
import theme, { commonStyles } from '../utils/theme';
import useErrorStore from '../store/errorStore';
import { Props } from '../screens/CreateAccountUsernameScreen';
import { formatUsername } from '../utils/username';

export default function TermsAndConditionContainer({ navigation }: { navigation: Props['navigation'] }) {
    let startUsername = '';

    if (!settings.isProduction()) {
        startUsername = 'test' + randomString(2);
    }

    const [username, setUsername] = useState(startUsername);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const errorStore = useErrorStore();

    const { user } = useUserStore();

    async function onNext() {
        if (username.includes(' ')) {
            setErrorMessage('Username must not contain spaces');
            return;
        }

        setLoading(true);

        const formattedUsername = username.toLowerCase();

        try {
            await user.saveUsername(formattedUsername);
        } catch (e: any) {
            if (e instanceof SdkError && e.code === SdkErrors.UsernameTaken) {
                setErrorMessage('Username already exists');
                setLoading(false);
                return;
            } else {
                errorStore.setError({ error: e, expected: false });
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        navigation.navigate('CreatePassphrase');
    }

    const onTextChange = (value) => {
        setUsername(formatUsername(value));
        if (errorMessage !== '') setErrorMessage('');
    };

    return (
        <LayoutComponent
            body={
                <View>
                    <TH1 style={commonStyles.textAlignCenter}>Terms & Conditions</TH1>
                    <View style={styles.innerContainer}>
                        <TP style={styles.headerLabel}>Terms & Conditions</TP>
                    </View>
                    <View>
                        <TP>Summary:</TP>
                        <TP></TP>
                        <TP>
                            ● You can use Tonomy ID to log into and share data with applications that support Tonomy ID.
                        </TP>
                        <TP>● Please remember or keep a secure copy of your master passphrase and username.</TP>
                        <TP>
                            ● You (and not the Tonomy Foundation) are responsible for using and behaving according to
                            regulatory requirements in applications you log into with Tonomy ID.
                        </TP>
                        <TP>
                            ● Tonomy ID uses advanced digital signatures to enhance data security, integrity, and
                            regulatory compliance for interactions with supported applications. Tonomy ID is regulated
                            under Dutch law.
                        </TP>
                    </View>
                </View>
            }
            footerHint={<></>}
            footer={
                <View style={commonStyles.marginTop}>
                    <View style={styles.buttonsRow}>
                        <TButtonOutlined onPress={onNext} style={styles.buttonsStyle} disabled={false}>
                            DECLINE
                        </TButtonOutlined>
                        <TButtonContained onPress={onNext} style={styles.buttonsStyle} disabled={false}>
                            ACCEPT
                        </TButtonContained>
                    </View>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    headerLabel: {
        textAlign: 'center',
    },
    buttonsRow: {
        textAlign: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonsStyle: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        width: '35%',
        marginLeft: 20,
        marginRight: 20,
    },
    innerContainer: { marginTop: 10, justifyContent: 'center' },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
