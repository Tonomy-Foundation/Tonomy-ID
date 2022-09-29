import HomeScreenContainer from '../containers/HomeScreenContainer'
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
  return (
    <HomeScreenContainer navigation={navigation}></HomeScreenContainer>
  );
}
