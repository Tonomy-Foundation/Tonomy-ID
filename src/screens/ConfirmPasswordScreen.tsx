import React from 'react';
import ConfirmPasswordContainer from '../containers/ConfirmPasswordContainer';
import { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'CreateAccountPassword'>;
export default function ConfirmPasswordScreen(props: Props) {
    return <ConfirmPasswordContainer navigation={props.navigation}></ConfirmPasswordContainer>;
}
