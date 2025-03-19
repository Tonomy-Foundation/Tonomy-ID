import React from 'react';
import StakeAssetDetailContainer from '../containers/StakeAssetDetailContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'StakeLeosDetail'>;

export default function StakeAssetDetailScreen(props: Props) {
    return (
        <StakeAssetDetailContainer
            chain={props.route.params.chain}
            navigation={props.navigation}
            loading={props.route.params.loading}
        ></StakeAssetDetailContainer>
    );
}
