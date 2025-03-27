import React from 'react';
import SuccessUnstakeContainer from '../containers/SuccessUnstakeContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SuccessUnstake'>;

export default function SuccessUnstakeScreen(props: Props) {
    return (
        <SuccessUnstakeContainer
            navigation={props.navigation}
            chain={props.route.params.chain}
        ></SuccessUnstakeContainer>
    );
}
