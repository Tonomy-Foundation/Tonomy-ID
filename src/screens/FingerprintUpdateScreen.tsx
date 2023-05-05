import React from 'react';
import FingerprintUpdateContainer from '../containers/FingerprintUpdateContainer';

import { RouteStackParamList } from '../navigation/Root';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Props = NativeStackScreenProps<RouteStackParamList, 'CreateAccountFingerprint'>;
export default function FingerprintUpdateScreen(props: Props) {
    return <FingerprintUpdateContainer password={props.route.params.password}></FingerprintUpdateContainer>;
}
