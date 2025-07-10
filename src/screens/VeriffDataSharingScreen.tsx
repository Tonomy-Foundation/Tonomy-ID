import React from 'react';
import VeriffDataSharingContainer from '../containers/VeriffDataSharingContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'VeriffDataSharing'>;

export default function VeriffDataSharingScreen(props: Props) {
    return (
        <VeriffDataSharingContainer
            navigation={props.navigation}
            payload={props.route.params.payload}
        ></VeriffDataSharingContainer>
    );
}
