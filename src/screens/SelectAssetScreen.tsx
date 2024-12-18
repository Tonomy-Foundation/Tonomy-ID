import React from 'react';
import SelectAssetContainer from '../containers/SelectAssetContainer';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type SelectAssetScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'SelectAsset'>;

export default function SelectAssetScreen(props: SelectAssetScreenNavigationProp) {
    return <SelectAssetContainer type={props.route.params?.type} navigation={props.navigation}></SelectAssetContainer>;
}
