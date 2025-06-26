import React from 'react';
import VeriffLoginContainer from '../containers/VeriffLoginContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'VeriffLogin'>;

export default function VeriffLoginScreen(props: Props) {
    return <VeriffLoginContainer navigation={props.navigation}></VeriffLoginContainer>;
}
