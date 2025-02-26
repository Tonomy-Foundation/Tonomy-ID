import React from 'react';
import ConfirmStakingContainer from '../containers/ConfirmStakingContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'ConfirmStaking'>;

export default function ConfirmStakingScreen(props: Props) {
    return (
        <ConfirmStakingContainer
            navigation={props.navigation}
            chain={props.route.params.chain}
            amount={props.route.params.amount}
            withDraw={props.route.params?.withDraw}
        ></ConfirmStakingContainer>
    );
}
