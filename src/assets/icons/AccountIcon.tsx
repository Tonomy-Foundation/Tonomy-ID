import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function AccountIcon(props: SvgProps) {
    let color = theme.colors.success;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.99935 2.16699C5.39697 2.16699 1.66602 5.89795 1.66602 10.5003C1.66602 15.1027 5.39697 18.8337 9.99935 18.8337C14.6017 18.8337 18.3327 15.1027 18.3327 10.5003C18.3327 5.89795 14.6017 2.16699 9.99935 2.16699Z" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.55957 15.7884C3.55957 15.7884 5.41709 13.417 10.0004 13.417C14.5837 13.417 16.4413 15.7884 16.4413 15.7884" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 10.5C11.3807 10.5 12.5 9.38075 12.5 8C12.5 6.61929 11.3807 5.5 10 5.5C8.61925 5.5 7.5 6.61929 7.5 8C7.5 9.38075 8.61925 10.5 10 10.5Z" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
