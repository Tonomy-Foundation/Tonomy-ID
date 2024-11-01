import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import WalletConnectLoginContainer from '../containers/WalletConnectLoginContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'WalletConnectLogin'>;

export default function WalletConnectLoginScreen(props: Props) {
    return <WalletConnectLoginContainer navigation={props.navigation} loginRequest={props.route.params.loginRequest} />;
}
