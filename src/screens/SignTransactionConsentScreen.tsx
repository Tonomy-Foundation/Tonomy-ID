import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SignTransactionConsentContainer from '../containers/SignTransactionConsentContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SignTransaction'>;

export default function SignTransactionConsentScreen(props: Props) {
    return (
        <SignTransactionConsentContainer
            transaction={props.route.params.transaction}
            key={props.route.params.key}
            navigation={props.navigation}
        />
    );
}
