import React from 'react';
import SendAssetContainer from '../containers/SendContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SelectAssetsStackParamList } from '../navigation/Assets/SelectAssets';

export type SendAssetScreenNavigationProp = NativeStackScreenProps<SelectAssetsStackParamList, 'Send'>;

export default function Send(props: SendAssetScreenNavigationProp) {
    return (
        <SendAssetContainer
            symbol={props.route.params?.symbol}
            name={props.route.params?.name}
            address={props.route.params?.address}
            icon={props.route.params?.icon}
            image={props.route.params?.image}
            navigation={props.navigation}
        ></SendAssetContainer>
    );
}
