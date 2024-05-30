import CreateEthereumKeyContainer from '../containers/CreateEthereumKeyContainer';
import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'CreateEthereumKey'>;

export default function CreateEthereumKeyScreen(props: Props) {
    return <CreateEthereumKeyContainer route={props.route} navigation={props.navigation}></CreateEthereumKeyContainer>;
}
