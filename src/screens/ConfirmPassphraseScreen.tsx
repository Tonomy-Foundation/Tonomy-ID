import React from 'react';
import ConfirmPassphraseWordContainer from '../containers/ConfirmPassphraseContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'ConfirmPassphrase'>;

export default function ConfirmPassphraseScreen(props: Props) {
    return (
        <ConfirmPassphraseWordContainer
            navigation={props.navigation}
            route={props.route}
        ></ConfirmPassphraseWordContainer>
    );
}
