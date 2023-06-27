import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import SetPasswordContainer from '../containers/SetPasswordContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SetPassword'>;

export default function ConfirmPasswordScreen(props: Props) {
    return <SetPasswordContainer navigation={props.navigation}></SetPasswordContainer>;
}
