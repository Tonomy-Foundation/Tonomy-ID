import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import CitizenshipContainer from '../containers/CitienshipContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Citizenship'>;

export default function CitizenshipScreen(props: Props) {
    return <CitizenshipContainer></CitizenshipContainer>;
}
