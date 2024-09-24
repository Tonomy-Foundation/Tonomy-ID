import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function CloseIcon(props: SvgProps) {
    let color = theme.colors.white;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M19 6.4L17.6 5L12 10.6L6.4 5L5 6.4L10.6 12L5 17.6L6.4 19L12 13.4L17.6 19L19 17.6L13.4 12L19 6.4Z" fill="${color}"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
