import React from 'react';
import ReceiveAssetContainer from '../containers/ReceiveContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SelectAssetsStackParamList } from '../navigation/Assets/SelectAssets';

export type ReceiveAssetScreenNavigationProp = NativeStackScreenProps<SelectAssetsStackParamList, 'Receive'>;

export default function Receive(props: ReceiveAssetScreenNavigationProp) {
    return (
        <ReceiveAssetContainer
            symbol={props.route.params?.symbol}
            name={props.route.params?.name}
            address={props.route.params?.address}
            icon={props.route.params?.icon}
            image={props.route.params?.image}
            navigation={props.navigation}
        ></ReceiveAssetContainer>
    );
}
