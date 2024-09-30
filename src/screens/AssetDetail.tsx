import React from 'react';
import AssetDetailContainer from '../containers/AssetDetailContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AssetDetailStackParamList } from '../navigation/AssetDetailNavigator';

export type AssetDetailScreenNavigationProp = NativeStackScreenProps<AssetDetailStackParamList, 'AssetDetail'>;

export default function AssetDetail(props: AssetDetailScreenNavigationProp) {
    return (
        <AssetDetailContainer network={props.route.params.network} navigation={props.navigation}></AssetDetailContainer>
    );
}
