import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from 'react-native-paper';
import TLink from '../components/atoms/TA';
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
                        <TP size={1}>Password</TP>

                        <TPasswordInput />
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
    container: {
        width: '100%',
        marginVertical: '33%',
    },
});
