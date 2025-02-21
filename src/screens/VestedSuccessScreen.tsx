import React from 'react';
import VestedSuccessContainer from '../containers/VestedSuccessContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SuccessVested'>;

export default function VestedSuccessScreen(props: Props) {
    return (
        <VestedSuccessContainer
            total={props.route.params.total}
            navigation={props.navigation}
            chain={props.route.params.chain}
        ></VestedSuccessContainer>
    );
}
