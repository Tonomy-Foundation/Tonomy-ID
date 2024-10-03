import React from 'react';
import SendAssetContainer from '../containers/SendAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type SendAssetScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'Send'>;

export default function SendAssetScreen(props: SendAssetScreenNavigationProp) {
    return (
        <SendAssetContainer
            chain={props.route.params.chain}
            privateKey={props.route.params.privateKey}
            network={props.route.params.network}
            navigation={props.navigation}
        ></SendAssetContainer>
    );
}
