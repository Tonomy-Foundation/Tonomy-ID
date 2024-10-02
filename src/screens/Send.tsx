import React from 'react';
import SendAssetContainer from '../containers/SendAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type SendAssetScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'Send'>;

export default function Send(props: SendAssetScreenNavigationProp) {
    return <SendAssetContainer network={props.route.params.network} navigation={props.navigation}></SendAssetContainer>;
}
