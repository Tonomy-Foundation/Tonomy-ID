import { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import FingerprintSettingsContainer from '../containers/FingerprintSettingsContainer';

import { RouteStackParamList } from '../navigation/Settings';

export type Props = NativeStackScreenProps<RouteStackParamList, 'FingerprintSettings'>;
export default function PinSettingsScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <FingerprintSettingsContainer navigation={navigation}></FingerprintSettingsContainer>;
}
