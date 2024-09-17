import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import AppsContainer from '../containers/AppsContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Apps'>;

export default function Apps(props: Props) {
    return <AppsContainer navigation={props.navigation}></AppsContainer>;
}
