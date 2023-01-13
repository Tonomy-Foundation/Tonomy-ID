import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import LoginUsernameContainer from '../containers/LoginUsernameContainer';
import { RouteStackParamList } from '../navigation/Root';
export type Props = NativeStackScreenProps<RouteStackParamList, 'LoginUsername'>;
export default function LoginUsernameScreen(props: Props) {
    return <LoginUsernameContainer navigation={props.navigation}></LoginUsernameContainer>;
}
