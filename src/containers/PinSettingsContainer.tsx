import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { TCaption, TP } from '../components/atoms/THeadings';
import LayoutComponent from '../components/layout';
import { commonStyles } from '../utils/theme';

import { IconButton } from 'react-native-paper';
import TNavigationButton from '../components/TNavigationButton';
import { Props } from '../screens/SettingsScreen';
import TModal from '../components/TModal';

export default function PinSettingsContainer({ navigation }: Props) {
    const [pinStatus, setPinStatus] = useState<boolean>(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Check the Pin Status
        // if User has already Added the Pin
        //  then disable the "add Pin" Button and Enable the "Change Pin" and "Remove Pin" Buttons
        // else
        //  then enable the "add Pin" Button and disable the "Change Pin" and "Remove Pin" Buttons
        setPinStatus(true);
    }, []);
    return (
        <>
            {showModal && (
                <TModal
                    onPress={() => {
                        setShowModal(false);
                    }}
                    buttonLabel={'Cancel'}
                    title={'Remove Pin'}
                    icon={'cancel'}
                    iconColor="red"
                    enableSecondButton={true}
                    secondButtonText="Remove"
                    secondButtonColor="red"
                    secondButtonOnPress={() => {
                        setShowModal(false);
                        navigation.navigate('ConfirmPassword');
                        // navigate to password challenge
                    }}
                >
                    <View>
                        <TP>Are you sure, you want to remove Pin </TP>
                    </View>
                </TModal>
            )}

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
                                throw new Error('Function not implemented.');
                            }}
                            title={'Change Pin'}
                        />
                        <TNavigationButton
                            disabled={!pinStatus}
                            onPress={function (): void {
                                setShowModal(true);
                            }}
                            title={'Remove Pin'}
                        />
                    </View>
                }
            ></LayoutComponent>
        </>
    );
}
