import { DrawerScreenProps } from '@react-navigation/drawer';
import React from 'react';
import MainContainer from '../containers/MainContainer';
import { RouteDrawerParamList } from '../navigation/Drawer';

export type MainScreenNavigationProp = DrawerScreenProps<RouteDrawerParamList, 'UserHome'>;
export default function MainScreen() {
    return <MainContainer></MainContainer>;
}
