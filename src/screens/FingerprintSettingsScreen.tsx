import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import FingerprintSettingsContainer from '../containers/FingerprintSettingsContainer';
import { SettingsStackParamList } from '../navigation/Settings';

export type Props = NativeStackScreenProps<SettingsStackParamList, 'FingerprintSettings'>;

export default function PinSettingsScreen({ navigation }: Props) {
    return <FingerprintSettingsContainer navigation={navigation}></FingerprintSettingsContainer>;
}
