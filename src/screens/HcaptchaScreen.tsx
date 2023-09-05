import React from 'react';
import HcaptchaContainer from '../containers/HcaptchaContainer';
import { RouteStackParamList } from '../navigation/Root';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Hcaptcha'>;

export default function HcaptchaScreen(props: Props) {
    return <HcaptchaContainer navigation={props.navigation} password={props.route.params.password}></HcaptchaContainer>;
}
