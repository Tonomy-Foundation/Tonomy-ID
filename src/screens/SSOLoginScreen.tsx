import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import SSOLoginContainer from '../containers/SSOLoginContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SSO'>;
export default function SSOLoginScreen(props: Props) {
    return <SSOLoginContainer></SSOLoginContainer>;
}
