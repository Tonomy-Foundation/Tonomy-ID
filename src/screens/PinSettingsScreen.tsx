import { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import { SettingsStackParamList } from '../navigation/Settings';
import PinSettingsContainer from '../containers/PinSettingsContainer';

export type Props = NativeStackScreenProps<SettingsStackParamList, 'PinSettings'>;
export default function PinSettingsScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <PinSettingsContainer navigation={navigation}></PinSettingsContainer>;
}
