import React from 'react';
import ConfirmFirstPassphraseWordContainer from '../containers/ConfirmFirstPassphraseWordContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'ConfirmFirstPassphraseWord'>;

export default function ConfirmFirstPassphraseWordScreen(props: Props) {
    return <ConfirmFirstPassphraseWordContainer navigation={props.navigation}></ConfirmFirstPassphraseWordContainer>;
}
