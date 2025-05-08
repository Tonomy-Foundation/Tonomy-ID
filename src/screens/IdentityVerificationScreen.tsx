import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { RouteStackParamList } from '../navigation/Root';
import IdentityVerificationContainer from '../containers/IdentityVerificationContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'IdentityVerification'>;

export default function IdentityVerificationScreen(props: Props) {
    return <IdentityVerificationContainer navigation={props.navigation} />;
}
