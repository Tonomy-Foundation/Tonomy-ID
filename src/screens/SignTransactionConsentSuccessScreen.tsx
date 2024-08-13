import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SignTransactionConsentSuccessContainer from '../containers/SignTransactionConsentSuccessContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SignTransactionSuccess'>;

export default function SignTransactionConsentSuccessScreen(props: Props) {
    return (
        <SignTransactionConsentSuccessContainer
            transactionDetails={props.route.params.transactionDetails}
            navigation={props.navigation}
        />
    );
}
