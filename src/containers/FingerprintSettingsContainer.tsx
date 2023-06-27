import React from 'react';
import { View } from 'react-native';
import LayoutComponent from '../components/layout';
import TNavigationButton from '../components/TNavigationButton';
import { Props } from '../screens/FingerprintSettingsScreen';
import theme from '../utils/theme';

export default function FingerprintSettingsContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <LayoutComponent
            body={
                <View style={{ marginTop: 40 }}>
                    <TNavigationButton
                        onPress={function (): void {
                            throw new Error('Function not implemented.');
                        }}
                        title={'Add Fingerprint'}
                    />
                    <TNavigationButton
                        onPress={function (): void {
                            throw new Error('Function not implemented.');
                        }}
                        title={'Remove Fingerprint'}
                    />

                    <TNavigationButton
                        onPress={function (): void {
                            throw new Error('Function not implemented.');
                        }}
                        title={'Change Fingerprint'}
                        color={theme.colors.error}
                    />
                </View>
            }
        ></LayoutComponent>
    );
}
