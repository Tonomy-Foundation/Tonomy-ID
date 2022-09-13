import React from 'react';
import CreateAccountcontainer from '../containers/CreateAccountContainer'
import { NavigationProp } from '@react-navigation/native';

export default function CreateAccountScreen({ navigation }: { navigation: NavigationProp<any> }) {
  return (
    <CreateAccountcontainer></CreateAccountcontainer>
  );
}

