import React from 'react';
import AssetDetailContainer from '../containers/AssetDetailContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AssetDetailStackParamList } from '../navigation/AssetDetailNavigator';

export type AssetDetailScreenNavigationProp = NativeStackScreenProps<AssetDetailStackParamList, 'AssetDetail'>;

export default function AssetDetail(props: AssetDetailScreenNavigationProp) {
    return (
        <AssetDetailContainer
            symbol={props.route.params?.symbol}
            name={props.route.params?.name}
            account={props.route.params?.account}
            icon={props.route.params?.icon}
            navigation={props.navigation}
            accountBalance={props.route.params?.accountBalance}
        ></AssetDetailContainer>
    );
}
