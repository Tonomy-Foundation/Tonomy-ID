import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function UserCircleSolid(props: SvgProps) {
    let color = theme.colors.black;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }

    const xml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="11.125" fill="${color}" stroke="${color}" stroke-width="1.75"/>
<path d="M6.6665 18.6667V17.5556C6.6665 14.4873 9.15382 12 12.2221 12C15.2903 12 17.7776 14.4873 17.7776 17.5556V18.6667" stroke="white" stroke-width="1.75" stroke-linecap="round"/>
<path d="M12.222 12.0007C14.063 12.0007 15.5553 10.5083 15.5553 8.66732C15.5553 6.82637 14.063 5.33398 12.222 5.33398C10.381 5.33398 8.88867 6.82637 8.88867 8.66732C8.88867 10.5083 10.381 12.0007 12.222 12.0007Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
