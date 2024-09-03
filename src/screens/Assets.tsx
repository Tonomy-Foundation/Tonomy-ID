import React from 'react';
import AssetsContainer from '../containers/AssetsContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type AssetsScreenNavigationProp = NativeStackScreenProps<RouteStackParamList, 'Assets'>;

export default function Assets(props: AssetsScreenNavigationProp) {
    return <AssetsContainer did={props.route.params?.did} navigation={props.navigation}></AssetsContainer>;
}
