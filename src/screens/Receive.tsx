import React from 'react';
import ReceiveAssetContainer from '../containers/ReceiveAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SelectAssetsStackParamList } from '../navigation/SelectAssetNavigator';

export type ReceiveAssetScreenNavigationProp = NativeStackScreenProps<SelectAssetsStackParamList, 'Receive'>;

export default function Receive(props: ReceiveAssetScreenNavigationProp) {
    return (
        <ReceiveAssetContainer
            network={props.route.params.network}
            navigation={props.navigation}
        ></ReceiveAssetContainer>
    );
}
