import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function HomeIcon(props: SvgProps) {
    let color = theme.colors.success;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.1667 17.5001H5.83333C3.99238 17.5001 2.5 16.0076 2.5 14.1667V8.92305C2.5 7.75744 3.10884 6.67651 4.10566 6.07238L8.27233 3.54713C9.33425 2.90356 10.6658 2.90356 11.7277 3.54713L15.8943 6.07238C16.8912 6.67651 17.5 7.75744 17.5 8.92305V14.1667C17.5 16.0076 16.0076 17.5001 14.1667 17.5001Z" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.5 14.167H12.5" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
