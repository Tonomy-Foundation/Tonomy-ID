import React from 'react';
import VestedAssetsContainer from '../containers/VestedAssetsContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type VestedAssetscreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'VestedAssets'>;

export default function VestedAssetsScreen(props: VestedAssetscreenNavigationProp) {
    return (
        <VestedAssetsContainer chain={props.route.params.chain} navigation={props.navigation}></VestedAssetsContainer>
    );
}
