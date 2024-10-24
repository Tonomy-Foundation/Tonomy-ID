import React from 'react';
import AssetDetailContainer from '../containers/AssetDetailContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type AssetDetailScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'AssetDetail'>;

export default function AssetDetailScreen(props: AssetDetailScreenNavigationProp) {
    return <AssetDetailContainer chain={props.route.params.chain} navigation={props.navigation}></AssetDetailContainer>;
}
