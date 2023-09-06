import React from 'react';
import ConfirmThirdPassphraseContainer from '../containers/ConfirmThirdPassphraseContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'ConfirmThirdPassphraseWord'>;

export default function ConfirmThirdPassphraseScreen(props: Props) {
    return <ConfirmThirdPassphraseContainer navigation={props.navigation}></ConfirmThirdPassphraseContainer>;
}
