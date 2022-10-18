import React from 'react';
import CreateAccountContainer from '../containers/CreateAccountContainer'
import { NavigationProp } from '@react-navigation/native';

export default function CreateAccountScreen({ navigation }: { navigation: NavigationProp<any> }) {
  return (
    <CreateAccountContainer></CreateAccountContainer>
  );
}

