import React from 'react';
import AssetManagerContainer from '../containers/AssetManagerContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'AssetManager'>;

export default function AssetManagerScreen(props: Props) {
    return (
        <AssetManagerContainer chain={props.route.params.chain} navigation={props.navigation}></AssetManagerContainer>
    );
}
