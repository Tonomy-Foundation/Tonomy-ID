import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import LayoutComponent from '../components/layout';
import { TCaption, TH1, TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import { Props } from '../screens/HomeScreen';
import TUsername from '../components/TUsername';
import settings from '../settings';
import TInfoBox from '../components/TInfoBox';
import { TButtonContained } from '../components/atoms/Tbutton';
import useUserStore from '../store/userStore';
import { TError } from '../components/TError';
import useErrorStore from '../store/errorStore';

export default function LoginUsernameContainer({ navigation }: { navigation: Props['navigation'] }) {
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { user } = useUserStore();
    const errorStore = useErrorStore();
    const {
        colors: { text },
    } = useTheme();
    const stylesColor = StyleSheet.create({
        text: {
            color: text,
        },
    });

    useEffect(() => {
        setErrorMessage('');
    }, [username]);

    const onNext = async () => {
        if (username.includes(' ')) {
            setErrorMessage('Username must not contain spaces');
            return;
        }

        const slugUsername = username.toLowerCase().trim();

        try {
            if (await user.usernameExists(slugUsername))
                navigation.navigate('LoginPassword', { username: slugUsername });
            else setErrorMessage('Username does not exist');
        } catch (error: any) {
            errorStore.setError({ error, expected: false });
        }
    };

    return (
        <LayoutComponent
            body={
                <View>
                    <TH1 style={commonStyles.textAlignCenter}>Username</TH1>
                    <View style={styles.container}>
                        <TP size={1}>Username</TP>
                        <View>
                            <TUsername value={username} onChangeText={setUsername} />
                        </View>
                        <TError>{errorMessage}</TError>
                    </View>
                </View>
            }
            footerHint={
                <View>
                    <TInfoBox
                        align="left"
                        icon="privacy"
                        description="Your username is private and can only be seen by you and those you share it with, not even the Tonomy Foundation can see it."
                        linkUrl={settings.config.links.privacyLearnMore}
                        linkUrlText="Learn more"
                    />
                </View>
            }
            footer={
                <View style={commonStyles.marginTop}>
                    <View style={commonStyles.marginBottom}>
                        <TButtonContained onPress={onNext} disabled={username.length === 0}>
                            NEXT
                        </TButtonContained>
                    </View>
                    <View style={styles.textContainer}>
                        <TP size={1}>{"Don't have an account? "}</TP>
                        <TouchableOpacity onPress={() => navigation.navigate('CreateAccountUsername')}>
                            <TP size={1} style={styles.link}>
                                Sign up
                            </TP>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        ></LayoutComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        justifyContent: 'center',
    },
    link: {
        color: theme.colors.primary,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
