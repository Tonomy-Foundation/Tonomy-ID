import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import ProfilePreviewContainer from '../containers/ProfilePreviewContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'ProfilePreview'>;

export default function ProfilePreviewScreen(props: Props) {
    return <ProfilePreviewContainer navigation={props.navigation}></ProfilePreviewContainer>;
}
