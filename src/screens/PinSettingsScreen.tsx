import { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import { RouteStackParamList } from '../navigation/Pin';
import PinSettingsContainer from '../containers/PinSettingsContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'PinSettings'>;
export default function PinSettingsScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <PinSettingsContainer navigation={navigation}></PinSettingsContainer>;
}
