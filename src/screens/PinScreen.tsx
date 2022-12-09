import React from 'react';
import PinScreenContainer from '../containers/PinScreenContainer';
import { NavigationProp, RouteProp } from '@react-navigation/native';

export default function PinScreen({
    route,
    navigation,
}: {
    route: RouteProp<{ params: { password: string }; navigation: NavigationProp<any> }, 'params'>;
}) {
    return <PinScreenContainer password={route.params.password} navigation={navigation}></PinScreenContainer>;
}
