import React from 'react';
import { View } from 'react-native';
import LayoutComponent from '../components/layout';
import TNavigationButton from '../components/TNavigationButton';
import { Props } from '../screens/FaceIdSettingsScreen';

export default function FaceIdSettingsContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <LayoutComponent
            body={
                <View style={{ marginTop: 40 }}>
                    <TNavigationButton
                        onPress={function (): void {
                            throw new Error('Function not implemented.');
                        }}
                        title={'Add Face ID'}
                    />
                    <TNavigationButton
                        onPress={function (): void {
                            throw new Error('Function not implemented.');
                        }}
                        title={'Remove Face ID'}
                    />
                </View>
            }
        ></LayoutComponent>
    );
}
