import React from 'react';
import PinScreenContainer from '../containers/PinScreenContainer';
import { NavigationProp } from '@react-navigation/native';

export default function PinScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <PinScreenContainer navigation={navigation}></PinScreenContainer>;
}
