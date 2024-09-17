import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function LinkOpenIcon(props: SvgProps) {
    let color = theme.colors.success;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V9C2 9.26522 2.10536 9.51957 2.29289 9.70711C2.48043 9.89464 2.73478 10 3 10H9C9.26522 10 9.51957 9.89464 9.70711 9.70711C9.89464 9.51957 10 9.26522 10 9V7M6 6L10 2M10 2V4.5M10 2H7.5" stroke="#007BFF" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
