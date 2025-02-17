import React from 'react';
import ConfirmUnStakingContainer from '../containers/ConfirmUnStakingContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'ConfirmUnStaking'>;

export default function ConfirmUnstakingScreen(props: Props) {
    return (
        <ConfirmUnStakingContainer
            navigation={props.navigation}
            chain={props.route.params.chain}
            amount={props.route.params.amount}
        ></ConfirmUnStakingContainer>
    );
}
