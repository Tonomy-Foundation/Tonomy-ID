import React from 'react';
import CreateAccountUsernameContainer from '../containers/CreateAccountUsernameContainer';
import { NavigationProp } from '@react-navigation/native';

export default function CreateAccountUsernameScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <CreateAccountUsernameContainer navigation={navigation}></CreateAccountUsernameContainer>;
}
