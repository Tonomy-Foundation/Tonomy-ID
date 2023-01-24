import React from 'react';
import { RouteStackParamList } from '../navigation/Root';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LoginPinScreenContainer from '../containers/LoginPinScreenContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'LoginWithPin'>;
export default function LoginPinScreen(props: Props) {
    return <LoginPinScreenContainer password={props.route.params.password} navigation={props.navigation} />;
}
