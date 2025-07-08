import React from 'react';
import VeriffLoadingContainer from '../containers/VeriffLoadingContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'VeriffLoading'>;

export default function VeriffLoadingScreen(props: Props) {
    return (
        <VeriffLoadingContainer
            navigation={props.navigation}
            kycPayload={props.route.params.kycPayload}
        ></VeriffLoadingContainer>
    );
}
