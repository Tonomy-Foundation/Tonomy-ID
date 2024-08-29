import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function FlashOnIcon(props: SvgProps) {
    let color = theme.colors.primary;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }

    const xml = `
    <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.55514 13.9826L7.02736 17.4549V23.2419H13.9718V17.4549L17.444 13.9826V8.1956H3.55514V13.9826ZM9.34218 0.09375H11.657V3.56597H9.34218V0.09375ZM0.661621 4.5787L2.2982 2.94097L4.7519 5.39699L3.11532 7.03472L0.661621 4.5787ZM16.2403 5.40046L18.6975 2.94676L20.3341 4.58333L17.8781 7.03819L16.2403 5.40046Z" fill="${color}"/>
</svg>
    `;

    return <SvgXml {...props} xml={xml} />;
}
