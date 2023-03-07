import React from 'react';
import CreateAccountUsernameContainer from '../containers/CreateAccountUsernameContainer';
import { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'CreateAccountUsername'>;
export default function CreateAccountUsernameScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <CreateAccountUsernameContainer navigation={navigation}></CreateAccountUsernameContainer>;
}
