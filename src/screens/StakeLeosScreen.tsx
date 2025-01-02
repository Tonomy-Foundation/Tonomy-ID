import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import StakeLeosContainer from '../containers/StakeLeosContainer';
import { RouteStackParamList } from '../navigation/Root';

export type StakeLesoscreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'StakeLeos'>;

export default function StakeLeosScreen(props: StakeLesoscreenNavigationProp) {
    return <StakeLeosContainer chain={props.route.params.chain} navigation={props.navigation}></StakeLeosContainer>;
}
