import React from 'react';
import CreateAccountPasswordContainer from '../containers/CreateAccountPasswordContainer';
import { NavigationProp } from '@react-navigation/native';

export default function CreateAccountScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <CreateAccountPasswordContainer navigation={navigation}></CreateAccountPasswordContainer>;
}
