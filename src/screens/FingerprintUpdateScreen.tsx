import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import FingerprintUpdateContainer from '../containers/FingerprintUpdateContainer';
import { RouteStackParamList } from '../navigation/Root';

export type FingerprintUpdateScreenProps = NativeStackScreenProps<RouteStackParamList, 'CreateAccountFingerprint'>;

export default function FingerprintUpdateScreen(props: FingerprintUpdateScreenProps) {
    return <FingerprintUpdateContainer password={props.route.params.password}></FingerprintUpdateContainer>;
}
