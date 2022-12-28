import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SSOLoginContainer from '../containers/SSOLoginContainer';
import { RouteStackParamList } from '../navigation/Root';

export type SSOLoginScreenProps = NativeStackScreenProps<RouteStackParamList, 'SSO'>;

export default function SSOLoginScreen(props: SSOLoginScreenProps) {
    return <SSOLoginContainer jwt={props.route.params.jwt} />;
}
