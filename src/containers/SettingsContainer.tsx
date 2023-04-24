import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform, ScrollView } from 'react-native';
import { TCaption, TP } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import { commonStyles } from '../utils/theme';

import { IconButton } from 'react-native-paper';
import TNavigationButton from '../components/TNavigationButton';
import { Props } from '../screens/SettingsScreen';
import FaceIdIcon from '../assets/icons/FaceIdIcon';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsContainer({ navigation }: Props) {
    return (
        <SafeAreaView>
            <ScrollView style={{ padding: 16 }}>
                <TP size={1}>SECURITY</TP>
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
                />
                <TP>ACCOUNT</TP>
                <TNavigationButton
                    onPress={function (): void {
                        throw new Error('Function not implemented.');
                    }}
                    title={'Logout'}
                    icon={'logout-variant'}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    faceIdIcon: { maxWidth: 24, marginHorizontal: 14 },
});
