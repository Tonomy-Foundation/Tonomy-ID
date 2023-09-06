import React from 'react';
import ConfirmSecondPassphraseWordContainer from '../containers/ConfirmSecondPassphraseWordContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'ConfirmSecondPassphraseWord'>;

export default function ConfirmSecondPassphraseWordScreen(props: Props) {
    return <ConfirmSecondPassphraseWordContainer navigation={props.navigation}></ConfirmSecondPassphraseWordContainer>;
}
