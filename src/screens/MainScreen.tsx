import { DrawerScreenProps } from '@react-navigation/drawer';
import React from 'react';
import MainContainer from '../containers/MainContainer';
import { DrawerStackParamList } from '../navigation/Drawer';

export type MainScreenNavigationProp = DrawerScreenProps<DrawerStackParamList, 'UserHome'>;
export default function MainScreen() {
    return <MainContainer></MainContainer>;
}
