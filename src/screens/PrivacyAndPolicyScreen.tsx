import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import PrivacyAndPolicyContainer from '../containers/PrivacyAndPolicyContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'PrivacyAndPolicy'>;

export default function PrivacyAndPolicyScreen(props: Props) {
    return <PrivacyAndPolicyContainer navigation={props.navigation}></PrivacyAndPolicyContainer>;
}
