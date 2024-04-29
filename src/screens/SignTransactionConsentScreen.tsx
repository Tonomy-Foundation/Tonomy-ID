import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SignTransactionConsentContainer from '../containers/SignTransactionConsentContainer';
import { RouteStackParamList } from '../navigation/Root';

export type SignTransactionConsentScreenProps = NativeStackScreenProps<RouteStackParamList, 'SignTransaction'>;

export default function SSOLoginScreen(props: SignTransactionConsentScreenProps) {
    return <SignTransactionConsentContainer navigation={props.navigation} />;
}
