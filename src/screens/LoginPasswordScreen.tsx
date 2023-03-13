import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import LoginPasswordContainer from '../containers/LoginPasswordContainer';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'LoginPassword'>;
export default function LoginPasswordScreen(props: Props) {
    console.log('Parametros', props);
    return (
        <LoginPasswordContainer
            username={props.route.params.username}
            navigation={props.navigation}
        ></LoginPasswordContainer>
    );
}
