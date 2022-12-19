import React from 'react';
import PinScreenContainer from '../containers/PinScreenContainer';
import { RouteStackParamList } from '../navigation/Root';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Props = NativeStackScreenProps<RouteStackParamList, 'CreateAccountPin'>;
export default function PinScreen(props: Props) {
    return <PinScreenContainer password={props.route.params.password} navigation={props.navigation} />;
}
