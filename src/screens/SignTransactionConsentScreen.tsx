import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SignTransactionConsentContainer from '../containers/SignTransactionConsentContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SignTransaction'>;

export default function SignTransactionConsentScreen(props: Props) {
    return (
        <SignTransactionConsentContainer
            transaction={props.route.params.transaction}
            privateKey={props.route.params.privateKey}
            origin={props.route.params.origin ?? ''}
            request={props.route.params.request}
            navigation={props.navigation}
            session={props.route.params.session}
        />
    );
}
