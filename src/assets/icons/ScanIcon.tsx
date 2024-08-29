import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function ScanIcon(props: SvgProps) {
    let color = theme.colors.white;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.86938 7.43436V4.65175C1.86938 3.91376 2.16255 3.20599 2.68439 2.68415C3.20623 2.16231 3.914 1.86914 4.65199 1.86914H7.4346M1.86938 18.5648V21.3474C1.86938 22.0854 2.16255 22.7932 2.68439 23.315C3.20623 23.8368 3.914 24.13 4.65199 24.13H7.4346M18.565 1.86914H21.3476C22.0856 1.86914 22.7934 2.16231 23.3152 2.68415C23.8371 3.20599 24.1303 3.91376 24.1303 4.65175V7.43436M18.565 24.13H21.3476C22.0856 24.13 22.7934 23.8368 23.3152 23.315C23.8371 22.7932 24.1303 22.0854 24.1303 21.3474V18.5648M6.0433 12.9996H19.9563" stroke="${color}" stroke-width="2.7826" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
