import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import StakeAssetContainer from '../containers/StakeAssetContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'StakeAsset'>;

export default function StakeAssetScreen(props: Props) {
    return <StakeAssetContainer chain={props.route.params.chain} navigation={props.navigation}></StakeAssetContainer>;
}
