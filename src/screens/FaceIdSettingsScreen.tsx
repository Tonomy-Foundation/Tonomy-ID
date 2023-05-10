import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import FaceIdSettingsContainer from '../containers/FaceIdSettingsContainer';
import { SettingsStackParamList } from '../navigation/Settings';

export type Props = NativeStackScreenProps<SettingsStackParamList, 'FaceIdSettings'>;

export default function PinSettingsScreen({ navigation }: Props) {
    return <FaceIdSettingsContainer navigation={navigation}></FaceIdSettingsContainer>;
}
