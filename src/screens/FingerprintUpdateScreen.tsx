import React from 'react';
import FingerprintUpdateContainer from '../containers/FingerprintUpdateContainer';

export default function FingerprintUpdateScreen(props: Props) {
    return <FingerprintUpdateContainer password={props.route.params.password}></FingerprintUpdateContainer>;
}
