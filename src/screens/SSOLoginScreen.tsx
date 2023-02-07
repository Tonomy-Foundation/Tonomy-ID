import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SSOLoginContainer from '../containers/SSOLoginContainer';
import { RouteStackParamList } from '../navigation/Root';

export type SSOLoginScreenProps = NativeStackScreenProps<RouteStackParamList, 'SSO'>;

export default function SSOLoginScreen(props: SSOLoginScreenProps) {
    return (
        <SSOLoginContainer requests={props.route.params.requests} platform={props.route.params.platform ?? 'mobile'} />
    );
}
