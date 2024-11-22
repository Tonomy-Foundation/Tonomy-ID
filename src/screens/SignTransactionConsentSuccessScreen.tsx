import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SignTransactionConsentSuccessContainer from '../containers/SignTransactionConsentSuccessContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SignTransactionSuccess'>;

export default function SignTransactionConsentSuccessScreen(props: Props) {
    return (
        <SignTransactionConsentSuccessContainer
            operations={props.route.params.operations}
            transaction={props.route.params.transaction}
            receipt={props.route.params.receipt}
            navigation={props.navigation}
            request={props.route.params.request}
        />
    );
}
