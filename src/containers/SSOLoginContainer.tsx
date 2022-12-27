import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LayoutComponent from '../components/layout';
import TonomyLogo from '../assets/tonomy/tonomy-logo1024.png';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import TInfoBox from '../components/TInfoBox';
import TCheckbox from '../components/molecules/TCheckbox';
import useUserStore from '../store/userStore';
import { TonomyUsername } from 'tonomy-id-sdk';
import { TH1, TH2, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import { useNavigation } from '@react-navigation/core';

export default function SSOLoginContainer() {
    const userStore = useUserStore();
    const user = userStore.user;

    const [app, setApp] = useState({
        account_name: '',
        app_name: 'Atomic Hub',
        username_hash: '',
        description: '',
        logo_url: 'https://revieweek.com/wp-content/uploads/2021/09/atomichub-logo.png',
        origin: 'https://wax.atomichub.io',
        version: 1,
    });
    const [checked, setChecked] = useState<boolean>(false);
    const [username, setUsername] = useState<TonomyUsername>({} as TonomyUsername);

    const navigation = useNavigation();

    async function setUserName() {
        const username = await user.storage.username;
        if (!username) {
            await user.logout();
            navigation.navigate('Home');
        }
        setUsername(username);
    }

    const toggleCheckbox = () => {
        setChecked((state) => !state);
    };

    useEffect(() => {
        setUserName();
    }, []);

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <Image style={[styles.logo, commonStyles.marginBottom]} source={TonomyLogo}></Image>

                    <TH1 style={commonStyles.textAlignCenter}>{username.username}</TH1>
                    {/* app dialog */}
                    <View style={[styles.AppDialog, styles.marginTop]}>
                        <Image style={styles.AppDialogImage} source={TonomyLogo}></Image>
                        <TH1 style={commonStyles.textAlignCenter}>{app.app_name}</TH1>
                        <TP style={commonStyles.textAlignCenter}>Wants you to log in to their application here:</TP>
                        <TLink to={app.origin}>{app.origin}</TLink>
                    </View>
                    <View style={styles.checkbox}>
                        <TCheckbox status={checked} onPress={toggleCheckbox}></TCheckbox>
                        <TP> Stay signed in</TP>
                    </View>
                </View>
            }
            footerHint={
                <View style={styles.infoBox}>
                    <TInfoBox
                        align="left"
                        icon="security"
                        description="100% secure. Only your phone can authorize your app login."
                        linkUrl={settings.config.links.securityLearnMore}
                        linkUrlText="Learn more"
                    />
                </View>
            }
            footer={
                <View>
                    <TButtonContained style={commonStyles.marginBottom}>Next</TButtonContained>
                    <TButtonOutlined>Cancel</TButtonOutlined>
                </View>
            }
        ></LayoutComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        textAlign: 'center',
    },
    logo: {
        width: 100,
        height: 100,
    },
    AppDialog: {
        borderWidth: 1,
        borderColor: 'grey',
        borderStyle: 'solid',
        borderRadius: 8,
        padding: 16,
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        minHeight: 200,
    },

    AppDialogImage: {
        width: 50,
        height: 50,
    },
    marginTop: {
        marginTop: 10,
    },
    infoBox: {
        marginBottom: 32,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
