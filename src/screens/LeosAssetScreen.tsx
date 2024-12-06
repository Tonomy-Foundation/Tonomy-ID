import React from 'react';
import LeosAssetContainer from '../containers/LeosAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type AssetDetailScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'LeosAssetManager'>;

export default function LeosAssetScreen(props: AssetDetailScreenNavigationProp) {
    return <LeosAssetContainer navigation={props.navigation}></LeosAssetContainer>;
}
