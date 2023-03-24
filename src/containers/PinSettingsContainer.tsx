import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import LayoutComponent from '../components/layout';

import TNavigationButton from '../components/TNavigationButton';
import { Props } from '../screens/SettingsScreen';

export default function PinSettingsContainer({ navigation }: Props) {
    const [pinStatus, setPinStatus] = useState<boolean>(false);

    useEffect(() => {
        // Check the Pin Status
        // if User has already Added the Pin
        //  then disable the "add Pin" Button and Enable the "Change Pin" and "Remove Pin" Buttons
        // else
        //  then enable the "add Pin" Button and disable the "Change Pin" and "Remove Pin" Buttons
        setPinStatus(false);
    }, []);
    return (
        <LayoutComponent
            body={
                <View style={{ marginTop: 40 }}>
                    <TNavigationButton
                        disabled={!pinStatus}
                        onPress={function (): void {
                            throw new Error('Function not implemented.');
                        }}
                        title={'Add Pin'}
                    />
                    <TNavigationButton
                        disabled={pinStatus}
                        onPress={function (): void {
                            navigation.navigate('ChangePin', { action: 'CHANGE_PIN' });
                        }}
                        title={'Change Pin'}
                    />
                    <TNavigationButton
                        disabled={pinStatus}
                        onPress={function (): void {
                            throw new Error('Function not implemented.');
                        }}
                        title={'Remove Pin'}
                    />
                </View>
            }
        ></LayoutComponent>
    );
}
