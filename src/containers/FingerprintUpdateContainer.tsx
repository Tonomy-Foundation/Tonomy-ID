/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import FingerprintIcon from '../assets/icons/FingerprintIcon';
import LayoutComponent from '../components/layout';
import useUserStore, { UserStatus } from '../store/userStore';
import { commonStyles } from '../utils/theme';
import * as LocalAuthentication from 'expo-local-authentication';
import TModal from '../components/TModal';
import useErrorStore from '../store/errorStore';
import { useNavigation } from '@react-navigation/native';
import FaceIdIcon from '../assets/icons/FaceIdIcon';
import TInfoBox from '../components/TInfoBox';
import settings from '../settings';

export default function CreateAccountContainer({ password }: { password: string }) {
    const [showModal, setShowModal] = useState(false);
    const [authFailed, setAuthFail] = useState(false);
    const userStore = useUserStore();
    const user = userStore.user;
    const errorStore = useErrorStore();
    const device = Platform.OS;
    const navigation = useNavigation();

    useEffect(() => {
        async function checkHardware() {
            const isSupported = await LocalAuthentication.hasHardwareAsync();

            if (!isSupported) {
                await onSkip();
            }
        }

        checkHardware();
    }, [])

    const onNext = async () => {
        try {
            const isAuthorized = await LocalAuthentication.isEnrolledAsync();

            if (!isAuthorized) {
                setShowModal(true);
                return;
            }

            const authenticated = await LocalAuthentication.authenticateAsync();

            if (authenticated?.success === true) {
                await user.saveFingerprint();
                await user.saveLocal();
                await updateKeys();
            } else {
                setShowModal(true);
                setAuthFail(true);
            }

        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    };

    const onSkip = async () => {
        await user.saveLocal();
        await updateKeys();
        navigation.navigate('Drawer');
    };

    async function updateKeys() {
        await user.updateKeys(password);
        userStore.setStatus(UserStatus.LOGGED_IN);
    }

    const openAppSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            Linking.openSettings();
        }
    };

    return (
        <>
            {showModal && (
                <TModal
                    enableLinkButton={true}
                    linkButtonText={'Settings'}
                    linkOnPress={openAppSettings}
                    onPress={() => {
                        setShowModal(false);
                        setAuthFail(false);
                    }}
                    buttonLabel={authFailed === true ? 'ok' : 'cancel'}
                    title={authFailed === true ? 'Authentication Failed' : 'Fingerprint not registered!'}
                    icon={authFailed === true ? 'danger' : 'cancel'}
                >
                    <View>
                        <TP>
                            {authFailed === true
                                ? 'You have failed to Authenticate, please try again'
                                : device === 'ios'
                                    ? 'You don’t have your Face Id registered, please register it with your device.'
                                    : 'You don’t have your Fingerprint registered, please register it with your device.'}
                        </TP>
                        {/* TODO: link to open settings */}
                    </View>
                </TModal>
            )}

            <LayoutComponent
                body={
                    <View>
                        <View>
                            <TH1>
                                {device === 'ios'
                                    ? 'Would you like to add a Face Id for added security?'
                                    : 'Would you like to add a fingerprint for added security?'}{' '}
                            </TH1>
                        </View>
                        <View>
                            <TP size={1}>
                                {device === 'ios'
                                    ? 'This is easier than using your Face Id every time.'
                                    : 'This is easier than using your PIN every time.'}
                            </TP>
                        </View>
                        <View style={styles.imageWrapper}>
                            {device === 'ios' ? (
                                <FaceIdIcon style={{ ...styles.image, padding: 80 }} />
                            ) : (
                                <FingerprintIcon style={styles.image} />
                            )}
                        </View>
                    </View>
                }
                footerHint={
                    <View style={commonStyles.marginBottom}>
                        <TInfoBox
                            align="left"
                            icon="security"
                            description="100% private. Your fingerprint data never leaves your phone."
                            linkUrl={settings.config.links.securityLearnMore}
                            linkUrlText="Learn more"
                        />
                    </View>
                }
                footer={
                    <View>
                        <TButtonContained onPress={onNext} style={commonStyles.marginBottom}>
                            Next
                        </TButtonContained>
                        <TButtonOutlined onPress={onSkip} style={commonStyles.marginBottom}>
                            Skip
                        </TButtonOutlined>
                    </View>
                }
            />
        </>
    );
}

const styles = StyleSheet.create({
    image: {
        marginTop: 50,
        alignSelf: 'center',
        width: 200,
        height: 200,
    },
    imageWrapper: {
        padding: 40,
        alignSelf: 'center',
    },
});
