import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { RouteStackParamList } from '../navigation/Root';
import FaceIdUpdateContainer from '../containers/FaceIDUpdateContainer';

export default function FaceIdUpdateScreen(props: Props) {
    return <FaceIdUpdateContainer password={props.route.params.password}></FaceIdUpdateContainer>;
}
