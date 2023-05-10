import React from 'react';
import CreateAccountPasswordContainer from '../containers/CreateAccountPasswordContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'CreateAccountPassword'>;

export default function CreateAccountScreen(props: Props) {
    return <CreateAccountPasswordContainer navigation={props.navigation}></CreateAccountPasswordContainer>;
}
