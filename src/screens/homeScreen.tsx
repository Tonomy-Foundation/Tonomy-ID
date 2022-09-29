import React from 'react';
import HomeScreenContainer from '../containers/HomeScreenContainer'
import { NavigationProp } from '@react-navigation/native';

export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
  return (
    <HomeScreenContainer></HomeScreenContainer>
  );
}

