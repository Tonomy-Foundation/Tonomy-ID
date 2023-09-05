import CreatePassphraseScreenContainer from '../containers/CreatePassphraseContainer';
import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'CreatePassphrase'>;

export default function CreatePassphraseScreen(props: Props) {
    return <CreatePassphraseScreenContainer navigation={props.navigation}></CreatePassphraseScreenContainer>;
}
