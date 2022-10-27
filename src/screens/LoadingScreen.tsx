import LoadingScreenContainer from '../containers/LoadingScreenContainer';
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

export default function LoadingScreen(LoadingScreenProps) {
  return <LoadingScreenContainer
    navigation={navigation}
    appLogoPropType={require("../assets/Telos.png")}
    tonomyLogoPropType={require("../assets/Tonomy.png")}
  >
  </LoadingScreenContainer>;
}
