import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SuccessContainer from '../containers/SuccessContainer';
import { RouteStackParamList } from '../navigation/Root';

export type SuccessNavigationProp = NativeStackScreenProps<RouteStackParamList, 'StakeLEOSSuccess'>;

export default function SuccessScreen(props: SuccessNavigationProp) {
    return <SuccessContainer chain={props.route.params.chain} navigation={props.navigation}></SuccessContainer>;
}
