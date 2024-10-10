import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { RouteStackParamList } from '../navigation/Root';
import SupportContainer from '../containers/SupportContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Support'>;

export default function SupportScreen(props: Props) {
    return <SupportContainer navigation={props.navigation}></SupportContainer>;
}
