import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LayoutComponent from '../components/layout';
import TonomyLogo from '../assets/tonomy/tonomy-logo1024.png';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import TInfoBox from '../components/TInfoBox';
import TCheckbox from '../components/molecules/TCheckbox';
import useUserStore from '../store/userStore';
import { UserApps, App, JWTLoginPayload, TonomyUsername } from 'tonomy-id-sdk';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import { useNavigation } from '@react-navigation/core';
import { ApplicationErrors, throwError } from '../utils/errors';
import useErrorStore from '../store/errorStore';

export default function SSOLoginContainer({ requests }: { requests: string }) {
    const userStore = useUserStore();
    const user = userStore.user;

    const [checked, setChecked] = useState<'checked' | 'unchecked' | 'indeterminate'>('unchecked');
    const [username, setUsername] = useState<TonomyUsername | undefined>(undefined);
    const [tonomyIdJwtPayload, setTonomyIdJwtPayload] = useState<JWTLoginPayload | undefined>(undefined);
    const [ssoJwtPayload, setSsoJwtPayload] = useState<JWTLoginPayload | undefined>(undefined);
    const [ssoApp, setSsoApp] = useState<App | undefined>(undefined);

    const navigation = useNavigation();
    const errorStore = useErrorStore();

    async function setUserName() {
        const username = await user.storage.username;
        if (!username) {
            await user.logout();
            navigation.navigate('Home');
        }
        setUsername(username);
    }

    async function getLoginFromJwt() {
        try {
            if (!requests || requests === '') {
                throwError('No request provided', ApplicationErrors.NoRequestData);
            }
            const jwtRequests = JSON.parse(requests);
            if (jwtRequests.length === 0) {
                throwError('No JWT provided', ApplicationErrors.NoRequestData);
            }

            for (const jwt of jwtRequests) {
                const verifiedJwt = await UserApps.verifyLoginJWT(jwt);
                const payload = verifiedJwt.payload as JWTLoginPayload;
                if (payload.origin === settings.config.ssoWebsiteOrigin) {
                    setTonomyIdJwtPayload(payload);
                } else {
                    setSsoJwtPayload(payload);
                    const app = await App.getApp(payload.origin);
                    setSsoApp(app);
                }
            }
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    function toggleCheckbox() {
        setChecked((state) => (state === 'checked' ? 'unchecked' : 'checked'));
    }

    async function onNext() {
        // TODO
        // navigation.navigate('PIN');
    }

    useEffect(() => {
        setUserName();
        getLoginFromJwt();
    }, []);

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <Image style={[styles.logo, commonStyles.marginBottom]} source={TonomyLogo}></Image>

                    {username?.username && <TH1 style={commonStyles.textAlignCenter}>{username.username}</TH1>}

                    {ssoApp && (
                        <View style={[styles.AppDialog, styles.marginTop]}>
                            <Image style={styles.AppDialogImage} source={TonomyLogo}></Image>
                            <TH1 style={commonStyles.textAlignCenter}>{ssoApp.appName}</TH1>
                            <TP style={commonStyles.textAlignCenter}>Wants you to log in to their application here:</TP>
                            <TLink to={ssoApp.origin}>{ssoApp.origin}</TLink>
                        </View>
                    )}

                    <View style={styles.checkbox}>
                        <TCheckbox status={checked} onPress={toggleCheckbox}></TCheckbox>
                        <TP>Stay signed in</TP>
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
                    <TButtonContained style={commonStyles.marginBottom} onPress={onNext}>
                        Next
                    </TButtonContained>
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
