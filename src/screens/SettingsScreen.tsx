import { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import SettingsContainer from '../containers/SettingsContainer';
import { RouteStackParamList } from '../navigation/Settings';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Settings'>;
export default function SettingsScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <SettingsContainer navigation={navigation}></SettingsContainer>;
}
