import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from 'react-native-paper';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import TPasswordInput from '../components/molecules/TPasswordInput';
import TInfoBox from '../components/TInfoBox';
import { Props } from '../screens/homeScreen';
import settings from '../settings';
import theme, { commonStyles } from '../utils/theme';

export default function LoginPasswordContainer({ navigation }: { navigation: Props['navigation'] }) {
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
                    <TH1>Password</TH1>
                    <View style={styles.container}>
                        <View style={styles.innerContainer}>
                            <TP size={1}>Password</TP>
                            <TPasswordInput />
                        </View>
                    </View>
                </View>
            }
            footerHint={
                <View style={commonStyles.marginBottom}>
                    <TInfoBox
                        align="left"
                        icon="security"
                        description="Your password Is never sent or stored or seen except on your phone. Nobody, not even Tonomy Foundation, can pretend to be you. "
                        linkUrl={settings.config.links.securityLearnMore}
                        linkUrlText="Learn more"
                    />
                </View>
            }
            footer={
                <View>
                    <View style={commonStyles.marginBottom}>
                        <TButtonContained>NEXT</TButtonContained>
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
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    innerContainer: {
        width: '100%',
        height: '60%',
    },
    link: {
        color: theme.colors.primary,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
