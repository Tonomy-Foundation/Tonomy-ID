import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function FlashOnIcon(props: SvgProps) {
    let color = theme.colors.primary;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }

    const xml = `
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.5003 3.5H10.5003C9.40038 3.5 8.85041 3.5 8.5087 3.84171C8.16699 4.18342 8.16699 4.73339 8.16699 5.83333V7C8.16699 8.21819 8.4849 9.41529 9.08929 10.473L10.5003 12.8333V21C10.5003 22.0872 10.5003 22.6308 10.6779 23.0596C10.9148 23.6313 11.369 24.0856 11.9407 24.3224C12.3696 24.5 12.9131 24.5 14.0003 24.5C15.0875 24.5 15.6311 24.5 16.06 24.3224C16.6316 24.0856 17.0859 23.6313 17.3228 23.0596C17.5003 22.6308 17.5003 22.0872 17.5003 21V12.8333L18.9114 10.473C19.5157 9.41529 19.8337 8.21819 19.8337 7V5.83333C19.8337 4.73339 19.8337 4.18342 19.4919 3.84171C19.1502 3.5 18.6003 3.5 17.5003 3.5Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.16699 7H19.8337" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 15.168V17.5013" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

    `;

    return <SvgXml {...props} xml={xml} />;
}
