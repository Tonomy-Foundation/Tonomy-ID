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
import useErrorStore from '../store/errorStore';
import { useRootNavigator } from '../navigation/Root';
import { openURL } from 'expo-linking';

export default function SSOLoginContainer({ requests }: { requests: string }) {
    const user = useUserStore((state) => state.user);
    const [app, setApp] = useState<App>({});
    const [checked, setChecked] = useState<'checked' | 'unchecked' | 'indeterminate'>('unchecked');
    const [username, setUsername] = useState<TonomyUsername | undefined>(undefined);
    const [tonomyIdJwtPayload, setTonomyIdJwtPayload] = useState<JWTLoginPayload | undefined>(undefined);
    const [ssoJwtPayload, setSsoJwtPayload] = useState<JWTLoginPayload | undefined>(undefined);
    const [ssoApp, setSsoApp] = useState<App | undefined>(undefined);

    const navigation = useRootNavigator();
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
            const verifiedRequests = await UserApps.verifyRequests(requests);

            for (const jwt of verifiedRequests) {
                const payload = jwt.payload as JWTLoginPayload;
                if (payload.origin === settings.config.ssoWebsiteOrigin) {
                    setTonomyIdJwtPayload(payload);
                    // TODO next line, but need to add this app to Bootstrap script first
                    // const app = await App.getApp(payload.origin);
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
        try {
            await user.apps.loginWithApp(ssoApp, ssoJwtPayload?.publicKey);

            let callbackUrl = settings.config.ssoWebsiteOrigin + '/callback?';
            callbackUrl += 'requests=' + requests;
            callbackUrl += '&username=' + (await user.storage.username);
            callbackUrl += '&accountName=' + (await user.storage.accountName.toString());

            await openURL(callbackUrl);
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
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
                        <View style={[styles.appDialog, styles.marginTop]}>
                            <Image style={styles.appDialogImage} source={{ uri: ssoApp.logoUrl }} />
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
                    <TButtonOutlined onPress={() => navigation.navigate('Home')}>Cancel</TButtonOutlined>
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
    appDialog: {
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
    appDialogImage: {
        aspectRatio: 1,
        height: 50,
        resizeMode: 'contain',
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
