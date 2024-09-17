import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import ExploreContainer from '../containers/ExploreContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Explore'>;

export default function Explore(props: Props) {
    return <ExploreContainer navigation={props.navigation}></ExploreContainer>;
}
