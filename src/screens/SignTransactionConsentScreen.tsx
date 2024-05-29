import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SignTransactionConsentContainer from '../containers/SignTransactionConsentContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SignTransaction'>;

export default function SSOLoginScreen(props: Props) {
    return (
        <SignTransactionConsentContainer
            requestEvent={props.route.params.requestEvent}
            requestSession={props.route.params.requestSession}
            navigation={props.navigation}
        />
    );
}
