import React from 'react';
import ReceiveAssetContainer from '../containers/ReceiveAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type ReceiveAssetScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'Receive'>;

export default function Receive(props: ReceiveAssetScreenNavigationProp) {
    return (
        <ReceiveAssetContainer
            network={props.route.params.network}
            navigation={props.navigation}
        ></ReceiveAssetContainer>
    );
}
