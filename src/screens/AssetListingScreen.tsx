import React from 'react';
import AssetsContainer from '../containers/AssetsContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type AssetsScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'Assets'>;

export default function AssetListingScreen(props: AssetsScreenNavigationProp) {
    return <AssetsContainer navigation={props.navigation}></AssetsContainer>;
}
