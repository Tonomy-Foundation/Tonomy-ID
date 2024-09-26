import React from 'react';
import SendAssetContainer from '../containers/SendAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SelectAssetsStackParamList } from '../navigation/SelectAssetNavigator';

export type SendAssetScreenNavigationProp = NativeStackScreenProps<SelectAssetsStackParamList, 'Send'>;

export default function Send(props: SendAssetScreenNavigationProp) {
    return (
        <SendAssetContainer
            symbol={props.route.params?.symbol}
            name={props.route.params?.name}
            account={props.route.params?.account}
            icon={props.route.params?.icon}
            navigation={props.navigation}
            accountBalance={props.route.params?.accountBalance}
        ></SendAssetContainer>
    );
}
