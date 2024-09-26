import React from 'react';
import ReceiveAssetContainer from '../containers/ReceiveAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SelectAssetsStackParamList } from '../navigation/SelectAssetNavigator';

export type ReceiveAssetScreenNavigationProp = NativeStackScreenProps<SelectAssetsStackParamList, 'Receive'>;

export default function Receive(props: ReceiveAssetScreenNavigationProp) {
    return (
        <ReceiveAssetContainer
            symbol={props.route.params?.symbol}
            name={props.route.params?.name}
            account={props.route.params?.account}
            icon={props.route.params?.icon}
            navigation={props.navigation}
            accountBalance={props.route.params?.accountBalance}
        ></ReceiveAssetContainer>
    );
}
