import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import FingerprintIcon from '../assets/icons/FingerprintIcon';
import LayoutComponent from '../components/layout';
import useUserStore from '../store/userStore';
import { useNavigation } from '@react-navigation/native';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
const { KeyManagerLevel } = settings.sdk;
import * as LocalAuthentication from 'expo-local-authentication';
import TModal from '../components/TModal';

export default function CreateAccountContainer({ password }: { password: string }) {
    const [showModal, setShowModal] = useState(false);
    const user = useUserStore((state) => state.user);
    const navigation = useNavigation();
    const onNext = async () => {
        try {
            const authenticated = LocalAuthentication.isEnrolledAsync();
            if (!authenticated) {
                setShowModal(true);
                return;
            }
            await user.saveFingerprint();

            await updateKeys();
        } catch (e) {
            console.error(e);
        }
    };

    const onSkip = () => {
        updateKeys();
    };

    async function updateKeys() {
        await user.updateKeys(password);
        navigation.navigate('home');
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
                        <TP>You don’t have your fingerprint registered, please register it with your device.</TP>
                    </View>
                </TModal>
            )}

            <LayoutComponent
                body={
                    <View>
                        <View>
                            <TH1>Would you like to add a fingerprint for added security?</TH1>
                        </View>
                        <View>
                            <TP size={1}>This is easier than using your PIN every time.</TP>
                        </View>
                        <View style={styles.imageWrapper}>
                            <FingerprintIcon style={styles.image}></FingerprintIcon>
                        </View>
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
