import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import FingerprintIcon from '../assets/icons/FingerprintIcon';
import LayoutComponent from '../components/layout';
import useUserStore from '../store/userStore';
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
    const user = useUserStore((state) => state.user);
    const errorStore = useErrorStore();
    const device = Platform.OS;

    const navigation = useNavigation();

    const onNext = async () => {
        try {
            const authenticated = LocalAuthentication.isEnrolledAsync();

            if (!authenticated) {
                setShowModal(true);
                return;
            }

            await user.saveFingerprint();

            await user.saveLocal();
            await updateKeys();
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    };

    const onSkip = async () => {
        await user.saveLocal();
        updateKeys();
    };

    async function updateKeys() {
        await user.updateKeys(password);
        navigation.navigate('Drawer');
    }

    return (
        <>
            {showModal && (
                <TModal
                    onPress={() => setShowModal(false)}
                    buttonLabel="cancel"
                    title="Fingerprint not registered!"
                    icon="info"
                >
                    <View>
                        <TP>
                            {device === 'ios'
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
