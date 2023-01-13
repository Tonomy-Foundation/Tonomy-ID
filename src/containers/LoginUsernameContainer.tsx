import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import LayoutComponent from '../components/layout';
import { TCaption, TH1, TP } from '../components/atoms/THeadings';
import theme, { commonStyles } from '../utils/theme';
import { Props } from '../screens/homeScreen';
import TUsername from '../components/TUsername';
import settings from '../settings';
import TInfoBox from '../components/TInfoBox';
import TButton, { TButtonContained } from '../components/atoms/Tbutton';
import TLink from '../components/atoms/TA';

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
                        <TButtonContained>NEXT</TButtonContained>
                    </View>
                    <View style={commonStyles.alignItemsCenter}>
                        <TP size={1}>
                            Don&apos;t have an account? <TLink href="signup">Sign up</TLink>
                        </TP>
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
        marginVertical: '33%',
    },
});
