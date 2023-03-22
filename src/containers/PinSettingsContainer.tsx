import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import LayoutComponent from '../components/layout';

import TNavigationButton from '../components/TNavigationButton';
import { Props } from '../screens/SettingsScreen';
import useUserStore from '../store/userStore';
import { KeyManagerLevel } from '@tonomy/tonomy-id-sdk';

export default function PinSettingsContainer({ navigation }: Props) {
    const [pinExist, setPinExist] = useState<boolean>(false);
    const { user } = useUserStore();

    useEffect(() => {
        async function checkPinStatus() {
            const pinFound = await user.apps.keyManager.getKey({ level: KeyManagerLevel.PIN });

            if (pinFound) {
                setPinExist(true);
            } else {
                setPinExist(false);
            }
        }

        checkPinStatus();
    }, []);
    return (
        <LayoutComponent
            body={
                <View style={{ marginTop: 40 }}>
                    <TNavigationButton
                        disabled={pinExist}
                        onPress={function (): void {
                            throw new Error('Function not implemented.');
                        }}
                        title={'Add Pin'}
                    />
                    <TNavigationButton
                        disabled={!pinExist}
                        onPress={function (): void {
                            navigation.navigate('ChangePin', { action: 'CHANGE_PIN' });
                        }}
                        title={'Change Pin'}
                    />
                    <TNavigationButton
                        disabled={!pinExist}
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
