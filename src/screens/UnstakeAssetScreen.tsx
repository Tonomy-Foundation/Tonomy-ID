import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import UnstakeAssetContainer from '../containers/UnstakeAssetContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'UnStakeAsset'>;

export default function UnstakeAssetScreen(props: Props) {
    return (
        <UnstakeAssetContainer chain={props.route.params.chain} navigation={props.navigation}></UnstakeAssetContainer>
    );
}
