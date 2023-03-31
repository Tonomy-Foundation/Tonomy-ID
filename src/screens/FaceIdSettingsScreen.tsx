import { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import FaceIdSettingsContainer from '../containers/FaceIdSettingsContainer';
import { RouteStackParamList } from '../navigation/Settings';

export type Props = NativeStackScreenProps<RouteStackParamList, 'FaceIdSettings'>;
export default function PinSettingsScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <FaceIdSettingsContainer navigation={navigation}></FaceIdSettingsContainer>;
}
