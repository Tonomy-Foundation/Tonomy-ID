import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import FingerprintUpdateContainer from '../containers/FingerprintUpdateContainer';
import { RouteStackParamList } from '../navigation/Root';

export default function FingerprintUpdateScreen(props: Props) {
    return <FingerprintUpdateContainer password={props.route.params.password}></FingerprintUpdateContainer>;
}
