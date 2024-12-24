import React from 'react';
import LeosAssetContainer from '../containers/LeosAssetContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'LeosAssetManager'>;

export default function LeosAssetScreen(props: Props) {
    return <LeosAssetContainer navigation={props.navigation}></LeosAssetContainer>;
}
