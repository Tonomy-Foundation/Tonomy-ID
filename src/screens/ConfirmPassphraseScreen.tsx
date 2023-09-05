import React from 'react';
import ConfirmPassphraseContainer from '../containers/ConfirmPassphraseContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'ConfirmPassphraseWord'>;

export default function ConfirmPassphraseScreen(props: Props) {
    return <ConfirmPassphraseContainer></ConfirmPassphraseContainer>;
}
