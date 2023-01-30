import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import { customColors } from '../../utils/theme';

export default function ChevronRightIcon(props: SvgProps) {
    const color = props.color ? props.color : customColors.success;
    const xml = `
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.00009 0L0.590088 1.41L5.17009 6L0.590088 10.59L2.00009 12L8.00009 6L2.00009 0Z" fill="#BEBEBE"/>    
    </svg>

    `;

    return <SvgXml {...props} xml={xml} />;
}
