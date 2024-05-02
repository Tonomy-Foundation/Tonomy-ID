import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import TNavigationButton from '../components/TNavigationButton';
import { Props } from '../screens/SettingsScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TP } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';
import TModal from '../components/TModal';
import theme from '../utils/theme';
import { TButtonText } from '../components/atoms/TButton';

export default function SettingsContainer({ navigation }: { navigation: Props['navigation'] }) {
    const { logout } = useUserStore();
    const [showModal, setShowModal] = useState(false);

    async function onModalPress() {
        setShowModal(false);
    }

    return (
        <SafeAreaView>
            <ScrollView style={{ paddingHorizontal: 16 }}>
                {/* <TP size={1}>SECURITY</TP>
                <TNavigationButton
                    onPress={() => {
                        navigation.navigate('ConfirmPassword');
                    }}
                    title={'Password'}
                    icon={'cog'}
                />
                <TNavigationButton
                    onPress={function (): void {
                        navigation.navigate('PinSettings');
                    }}
                    title={'PIN'}
                    icon={'lock'}
                />
                {Platform.OS === 'android' ? (
                    <TNavigationButton
                        onPress={() => {
                            navigation.navigate('FingerprintSettings');
                        }}
                        title={'Fingerprint'}
                        icon={'fingerprint'}
                    />
                ) : (
                    <TNavigationButton
                        onPress={() => {
                            navigation.navigate('FaceIdSettings');
                        }}
                        title={'FaceID'}
                        icon={<FaceIdIcon style={styles.faceIdIcon} />}
                    />
                )}
                <TP size={1}>AUTONOMOUS ACCOUNT RECOVERY</TP>
                <TNavigationButton
                    onPress={function (): void {
                        throw new Error('Function not implemented.');
                    }}
                    title={'Security Questions'}
                    icon={'help-circle'}
                    description={
                        'Allow your account to be autonomously recovered when you correctly answer questions only you know about your life'
                    }
                />
                <TNavigationButton
                    onPress={function (): void {
                        throw new Error('Function not implemented.');
                    }}
                    title={'NFC Card Recovery'}
                    icon={'credit-card-outline'}
                    description={
                        'Allow your account to be autonomously recovered when you tap your secure NFC enabled keycard to your phone.'
                    }
                />
                <TNavigationButton
                    onPress={function (): void {
                        throw new Error('Function not implemented.');
                    }}
                    title={'Recovery Buddies'}
                    icon={'account-supervisor'}
                    description={'Allow your account to be autonomously recovered by a group of people you trust.'}
                />
                <TP>LANGUAGE</TP>
                <TNavigationButton
                    onPress={function (): void {
                        throw new Error('Function not implemented.');
                    }}
                    title={'Choose Language'}
                    icon={'translate'}
                /> */}
                <TP>ACCOUNT</TP>
                <TNavigationButton
                    onPress={async () => {
                        await logout('Logout in settings menu');
                    }}
                    title={'Logout'}
                    icon={'logout-variant'}
                />
                <TNavigationButton
                    onPress={() => setShowModal(true)}
                    title={'Delete Account'}
                    icon={'delete'}
                    textColor={theme.colors.error}
                />
            </ScrollView>
            <TModal
                visible={showModal}
                onPress={onModalPress}
                title={''}
                footer={
                    <View style={styles.footerButtonRow}>
                        <View>
                            <TButtonText onPress={() => setShowModal(false)}>
                                <Text style={{ color: theme.colors.grey1 }}>Cancel</Text>
                            </TButtonText>
                        </View>
                        <View>
                            <TButtonText
                                onPress={async () => {
                                    await logout('Logout in settings menu');
                                }}
                            >
                                <Text style={{ color: theme.colors.error }}>Delete</Text>
                            </TButtonText>
                        </View>
                    </View>
                }
            >
                <View>
                    <Text style={styles.deleteHeading}>Are you sure you would like to delete this wallet?</Text>
                </View>
                <View>
                    <Text style={styles.deleteText}>Make sure you remember your 6 word passphrase.</Text>
                </View>
            </TModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    faceIdIcon: { maxWidth: 24, marginHorizontal: 14 },
    footerButtonRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 90,
    },
    deleteHeading: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    deleteText: {
        textAlign: 'center',
        marginHorizontal: 11,
        fontSize: 14,
    },
});
