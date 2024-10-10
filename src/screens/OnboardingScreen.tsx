import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import OnboardingContainer from '../containers/OnboardingContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'Onboarding'>;

export default function OnboardingScreen(props: Props) {
    return <OnboardingContainer navigation={props.navigation}></OnboardingContainer>;
}
