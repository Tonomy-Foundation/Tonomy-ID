import React from 'react';
import VestedSuccessContainer from '../containers/VestedSuccessContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SuccessVestingWithdraw'>;

export default function VestedSuccessScreen(props: Props) {
    return (
        <VestedSuccessContainer navigation={props.navigation} chain={props.route.params.chain}></VestedSuccessContainer>
    );
}
