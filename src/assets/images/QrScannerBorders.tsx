import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function PrivacyIcon(props: SvgProps) {
    const color = props.color ? props.color : theme.colors.primary;
    const xml = `
    <svg width="244" height="252" viewBox="0 0 244 252" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 105.576L2 14C2 7.37259 7.37258 2 14 2L103.158 2" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
    <path d="M242 105.576L242 13.9998C242 7.37235 236.627 1.99976 230 1.99976L140.842 1.99976" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
    <path d="M2 146.424L2 238C2 244.628 7.37258 250 14 250L103.158 250" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
    <path d="M242 146.424L242 238.001C242 244.628 236.627 250.001 230 250.001L140.842 250.001" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
    </svg>
    `;

    return <SvgXml {...props} xml={xml} />;
}
