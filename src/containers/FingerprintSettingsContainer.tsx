import React from 'react';
import { View, StyleSheet } from 'react-native';

import LayoutComponent from '../components/layout';

import TNavigationButton from '../components/TNavigationButton';
import { Props } from '../screens/SettingsScreen';
import theme, { commonStyles } from '../utils/theme';

export default function FingerprintSettingsContainer({ navigation }: Props) {
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
