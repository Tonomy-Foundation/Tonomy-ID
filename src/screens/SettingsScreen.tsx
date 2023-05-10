import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SettingsContainer from '../containers/SettingsContainer';
import { SettingsStackParamList } from '../navigation/Settings';

export type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

export default function SettingsScreen(props: Props) {
    return <SettingsContainer navigation={props.navigation}></SettingsContainer>;
}
