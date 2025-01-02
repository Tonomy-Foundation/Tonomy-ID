import React from 'react';
import StakeLeosDetailContainer from '../containers/StakeLeosDetailContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'StakeLeosDetail'>;

export default function StakeLeosDetailScreen(props: Props) {
    return (
        <StakeLeosDetailContainer
            chain={props.route.params.chain}
            navigation={props.navigation}
        ></StakeLeosDetailContainer>
    );
}
