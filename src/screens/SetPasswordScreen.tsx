import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/ChangePassword';
import SetPasswordContainer from '../containers/SetPasswordContainer';
import { NavigationProp } from '@react-navigation/native';

export type Props = NativeStackScreenProps<RouteStackParamList, 'SetPassword'>;
export default function ConfirmPasswordScreen({ navigation }: { navigation: NavigationProp<any> }) {
    return <SetPasswordContainer navigation={navigation}></SetPasswordContainer>;
}
