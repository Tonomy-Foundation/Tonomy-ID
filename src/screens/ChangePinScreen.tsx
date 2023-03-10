import React from 'react';
import { RouteStackParamList } from '../navigation/Root';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ChangePinScreenContainer from '../containers/ChangePinScreenContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'CreateAccountPin'>;
export default function ChangePinScreen(props: Props) {
    return <ChangePinScreenContainer navigation={props.navigation} />;
}
