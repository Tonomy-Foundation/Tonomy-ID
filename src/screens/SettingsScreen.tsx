import { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import SettingsContainer from '../containers/SettingsContainer';
import { SettingsStackParamList } from '../navigation/Settings';

export type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;
export default function SettingsScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <SettingsContainer navigation={navigation}></SettingsContainer>;
}
