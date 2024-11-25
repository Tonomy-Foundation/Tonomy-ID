import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function CompassSolid(props: SvgProps) {
    let color = theme.colors.black;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }

    const xml = `
    <svg width="29" height="28" viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="14.5" cy="14" r="12" fill="${color}"/>
<path d="M12.8493 12.3494L20.2739 8.22461L16.1491 15.6493L8.72449 19.774L12.8493 12.3494Z" fill="${color}" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14.4997 25.6663C20.9429 25.6663 26.1663 20.4429 26.1663 13.9997C26.1663 7.55635 20.9429 2.33301 14.4997 2.33301C8.05635 2.33301 2.83301 7.55635 2.83301 13.9997C2.83301 20.4429 8.05635 25.6663 14.4997 25.6663Z" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

`;

    return <SvgXml {...props} xml={xml} />;
}
