import React from 'react';
import ReceiveAssetContainer from '../containers/ReceiveAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type ReceiveAssetScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'Receive'>;

export default function ReceiveAssetScreen(props: ReceiveAssetScreenNavigationProp) {
    return (
        <ReceiveAssetContainer chain={props.route.params.chain} navigation={props.navigation}></ReceiveAssetContainer>
    );
}
