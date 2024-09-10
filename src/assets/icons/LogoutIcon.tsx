import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function LogoutIcon(props: SvgProps) {
    let color = theme.colors.success;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 10H15.8333M15.8333 10L13.3333 12.5M15.8333 10L13.3333 7.5" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.8337 5V4.16667C15.8337 3.24619 15.0875 2.5 14.167 2.5H5.83366C4.91318 2.5 4.16699 3.24619 4.16699 4.16667V15.8333C4.16699 16.7538 4.91318 17.5 5.83366 17.5H14.167C15.0875 17.5 15.8337 16.7538 15.8337 15.8333V15" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
