import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function SettingsIcon(props: SvgProps) {
    let color = theme.colors.success;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61925 11.3807 7.5 10 7.5C8.61925 7.5 7.5 8.61925 7.5 10C7.5 11.3807 8.61925 12.5 10 12.5Z" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.3523 8.66316L15.4376 6.45433L16.667 5.00033L15.0003 3.33366L13.5542 4.56945L11.2985 3.64178L10.7797 1.66699H9.15116L8.62458 3.66793L6.42067 4.59696L5.00033 3.33366L3.33366 5.00033L4.5448 6.49103L3.64408 8.70557L1.66699 9.16699V10.8337L3.66792 11.3799L4.59678 13.5834L3.33366 15.0003L5.00033 16.667L6.49296 15.4506L8.66449 16.3439L9.16699 18.3337H10.8337L11.3374 16.3447L13.5462 15.4299C13.9144 15.6931 15.0003 16.667 15.0003 16.667L16.667 15.0003L15.4302 13.5415L16.3452 11.332L18.3336 10.8147L18.3337 9.16699L16.3523 8.66316Z" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
