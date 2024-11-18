import CreateEthereumKeyContainer from '../containers/CreateEthereumKeyContainer';
import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'CreateEthereumKey'>;

export default function CreateEthereumKeyScreen(props: Props) {
    return (
        <CreateEthereumKeyContainer
            requestType={props.route.params.requestType}
            request={props.route.params.request ?? null}
            transaction={props.route.params?.transaction ?? null}
            navigation={props.navigation}
        ></CreateEthereumKeyContainer>
    );
}
