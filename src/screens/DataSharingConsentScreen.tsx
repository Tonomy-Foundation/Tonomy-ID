import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import DataSharingConsentContainer from '../containers/DataSharingConsentContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'DataSharingConsent'>;

export default function DataSharingConsentScreen(props: Props) {
    return (
        <DataSharingConsentContainer
            payload={props.route.params.payload}
            platform={props.route.params.platform ?? 'mobile'}
        />
    );
}
