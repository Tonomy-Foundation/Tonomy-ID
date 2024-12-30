import React from 'react';
import StakingManagerContainer from '../containers/StakingManagerContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'StakingManager'>;

export default function StakingManagerScreen(props: Props) {
    return (
        <StakingManagerContainer
            chain={props.route.params.chain}
            navigation={props.navigation}
        ></StakingManagerContainer>
    );
}
