import { NavigationProp, RouteProp } from '@react-navigation/native';
import React from 'react';
import FingerprintUpdateContainer from '../containers/FingerprintUpdateContainer';

export default function FingerprintUpdateScreen({
    route,
}: {
    route: RouteProp<{ params: { password: string } }, 'params'>;
}) {
    return <FingerprintUpdateContainer password={route.params.password}></FingerprintUpdateContainer>;
}
