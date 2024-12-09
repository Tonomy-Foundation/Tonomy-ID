import React from 'react';
import LeosAssetContainer from '../containers/LeosAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type LeosAssetsScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'LeosAssetManager'>;

export default function LeosAssetScreen(props: LeosAssetsScreenNavigationProp) {
    return <LeosAssetContainer chain={props.route.params.chain} navigation={props.navigation}></LeosAssetContainer>;
}
