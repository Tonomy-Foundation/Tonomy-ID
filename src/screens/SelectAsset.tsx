import React from 'react';
import SelectAssetContainer from '../containers/SelectAssetContainer';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SelectAssetsStackParamList } from '../navigation/Assets/SelectAssets';

export type SelectAssetScreenNavigationProp = NativeStackScreenProps<SelectAssetsStackParamList, 'SelectAsset'>;

export default function SelectAsset(props: SelectAssetScreenNavigationProp) {
    return (
        <SelectAssetContainer
            did={props.route.params?.did}
            type={props.route.params?.type}
            navigation={props.navigation}
        ></SelectAssetContainer>
    );
}
