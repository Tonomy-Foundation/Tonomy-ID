import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import WalletConnectLoginContainer from '../containers/WalletConnectLoginContainer';
import { RouteStackParamList } from '../navigation/Root';

export type WalletConnectLoginScreenProps = NativeStackScreenProps<RouteStackParamList, 'WalletConnectLogin'>;

export default function WalletConnectLoginScreen(props: WalletConnectLoginScreenProps) {
    return (
        <WalletConnectLoginContainer
            payload={props.route.params.payload}
            platform={props.route.params.platform ?? 'mobile'}
        />
    );
}
