import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import KycOnboardingContainer from '../containers/KycOnboardingContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'KycOnboarding'>;

export default function KycOnboardingScreen(props: Props) {
    return <KycOnboardingContainer navigation={props.navigation}></KycOnboardingContainer>;
}
