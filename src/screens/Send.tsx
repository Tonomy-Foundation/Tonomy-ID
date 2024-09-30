import React from 'react';
import SendAssetContainer from '../containers/SendAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SelectAssetsStackParamList } from '../navigation/SelectAssetNavigator';

export type SendAssetScreenNavigationProp = NativeStackScreenProps<SelectAssetsStackParamList, 'Send'>;

export default function Send(props: SendAssetScreenNavigationProp) {
    return <SendAssetContainer network={props.route.params.network} navigation={props.navigation}></SendAssetContainer>;
}
