import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import LayoutComponent from '../components/layout';
import { TH1, TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import { Props } from '../screens/homeScreen';
import TUsername from '../components/TUsername';
import settings from '../settings';
import TInfoBox from '../components/TInfoBox';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function LoginUsernameContainer({ navigation }: { navigation: Props['navigation'] }) {
    const {
        colors: { text },
    } = useTheme();
    const stylesColor = StyleSheet.create({
        text: {
            color: text,
        },
    });

    return (
        <LayoutComponent
            body={
                <View>
                    <TH1>Username</TH1>
                    <View style={styles.container}>
                        <TP size={1}>Username</TP>
                        <View style={styles.inputContainer}>
                            <TUsername suffix={settings.config.accountSuffix} />
                        </View>
                    </View>
                </View>
            }
            footerHint={
                <View style={commonStyles.marginBottom}>
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
                <View>
                    <View style={commonStyles.marginBottom}>
                        <TButtonContained
                            onPress={() => {
                                navigation.navigate('LoginPassword');
                            }}
                        >
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
    inputContainer: {
        borderWidth: 1,
        borderColor: theme.colors.disabled,
    },
    container: {
        width: '100%',
        height: '100%',
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
