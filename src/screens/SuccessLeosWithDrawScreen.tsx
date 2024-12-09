import React from 'react';
import SuccessLeosWithDrawContainer from '../containers/SuccessLeosWithDrawContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'VestedWithDrawSuccess'>;

export default function SuccessLeosWithDrawScreen(props: Props) {
    return (
        <SuccessLeosWithDrawContainer
            navigation={props.navigation}
            chain={props.route.params.chain}
        ></SuccessLeosWithDrawContainer>
    );
}
