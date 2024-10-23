import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SettingsContainer from '../containers/SettingsContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Settings'>;

export default function SettingsScreen(props: Props) {
    return <SettingsContainer navigation={props.navigation}></SettingsContainer>;
}
