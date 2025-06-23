import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function ExternalLinkIcon(props: SvgProps) {
    let color = theme.colors.primary;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }

    const xml = `
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 19L19 6M19 6V18.48M19 6H6.52" stroke=${color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
