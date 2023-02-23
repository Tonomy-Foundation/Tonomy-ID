import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TH1, TP } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import useUserStore from '../store/userStore';
import { commonStyles } from '../utils/theme';
import * as LocalAuthentication from 'expo-local-authentication';
import TModal from '../components/TModal';
import useErrorStore from '../store/errorStore';
import { useNavigation } from '@react-navigation/native';
import FaceIdIcon from '../assets/icons/FaceIdIcon';

export default function FaceIdUpdateContainer({ password }: { password: string }) {
    const [showModal, setShowModal] = useState(false);
    const user = useUserStore((state) => state.user);
    const errorStore = useErrorStore();

    const navigation = useNavigation();

    const onNext = async () => {
        try {
            console.log('face Id to be detected on ios and updated on block chain');
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    };

    const onSkip = async () => {
        navigation.navigate('Drawer');
    };

    async function updateKeys() {
        await user.updateKeys(password);
    }

    return (
        <>
            {showModal && (
                <TModal
                    onPress={() => setShowModal(false)}
                    buttonLabel="cancel"
                    title="Face ID not registered!"
                    icon="info"
                >
                    <View>
                        <TP>You don’t have your Face Id registered, please register it with your device.</TP>
                        {/* TODO: link to open settings */}
                    </View>
                </TModal>
            )}

            <LayoutComponent
                body={
                    <View>
                        <View>
                            <TH1>Would you like to add a Face Id for added security?</TH1>
                        </View>
                        <View>
                            <TP size={1}>This is easier than using your PIN every time.</TP>
                        </View>
                        <View style={styles.imageWrapper}>
                            <FaceIdIcon style={styles.image}></FaceIdIcon>
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
