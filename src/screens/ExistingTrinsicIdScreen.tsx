import React from 'react';
import ExistingTrinsicIdContainer from '../containers/ExistingTrinsicIdContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'ExistingTrinsicId'>;

export default function ExistingTrinsicIdScreen(props: Props) {
    return <ExistingTrinsicIdContainer navigation={props.navigation}></ExistingTrinsicIdContainer>;
}
