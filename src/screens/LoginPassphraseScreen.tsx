import LoginPassphraseContainer from '../containers/LoginPassphraseContainer';
import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'LoginPassphrase'>;

export default function LoginPassphraseScreen(props: Props) {
    return <LoginPassphraseContainer navigation={props.navigation}></LoginPassphraseContainer>;
}
