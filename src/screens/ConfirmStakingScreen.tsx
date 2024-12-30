import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ConfirmStakingContainer from '../containers/ConfirmStakingContainer ';
import { RouteStackParamList } from '../navigation/Root';

export type ConfirmStakingNavigationProp = NativeStackScreenProps<RouteStackParamList, 'ConfirmStaking'>;

export default function ConfirmStakingScreen(props: ConfirmStakingNavigationProp) {
    const { chain, amount } = props.route.params;

    return (
        <ConfirmStakingContainer chain={chain} amount={amount} navigation={props.navigation}></ConfirmStakingContainer>
    );
}
