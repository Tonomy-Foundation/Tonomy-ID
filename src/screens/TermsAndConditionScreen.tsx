import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteStackParamList } from '../navigation/Root';
import TermsAndConditionContainer from '../containers/TermsAndConditionContainer';

export type Props = NativeStackScreenProps<RouteStackParamList, 'TermsAndCondition'>;

export default function TermsAndConditionScreen(props: Props) {
    return <TermsAndConditionContainer navigation={props.navigation}></TermsAndConditionContainer>;
}
