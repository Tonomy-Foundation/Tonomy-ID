import React from 'react';
import CreateAccountUsernameContainer from '../containers/CreateAccountUsernameContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'CreateAccountUsername'>;

export default function CreateAccountUsernameScreen(props: Props) {
    return <CreateAccountUsernameContainer navigation={props.navigation}></CreateAccountUsernameContainer>;
}
