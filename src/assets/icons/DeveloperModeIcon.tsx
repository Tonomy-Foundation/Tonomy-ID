import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function DeveloperModeIcon(props: SvgProps) {
    let color = theme.colors.success;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.2497 5L8.33301 15.4167" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.41667 7.08301L2.5 9.99967L5.41667 12.9163" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14.583 7.08301L17.4997 9.99967L14.583 12.9163" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
