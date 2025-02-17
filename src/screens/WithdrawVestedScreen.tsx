import React from 'react';
import WithDrawVestedContainer from '../containers/WithDrawVestedContainer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';

export type Props = NativeStackScreenProps<RouteStackParamList, 'WithdrawVested'>;

export default function WithdrawVestedScreen(props: Props) {
    return <WithDrawVestedContainer navigation={props.navigation} chain={props.route.params.chain} />;
}
