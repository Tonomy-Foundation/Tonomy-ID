import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SSOLoginContainer from '../containers/SSOLoginContainer';
import { RouteStackParamList } from '../navigation/Root';

export type SSOLoginScreenProps = NativeStackScreenProps<RouteStackParamList, 'SSO'>;

export default function SSOLoginScreen(props: SSOLoginScreenProps) {
    return (
        <SSOLoginContainer
            navigation={props.navigation}
            payload={props.route.params.payload}
            receivedVia={props.route.params.receivedVia ?? 'deepLink'}
        />
    );
}
