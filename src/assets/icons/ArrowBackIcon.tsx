import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function ArrowBackIcon(props: SvgProps) {
    let color = theme.colors.success;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.9999 11.0001V13.0001H7.99991L13.4999 18.5001L12.0799 19.9201L4.15991 12.0001L12.0799 4.08008L13.4999 5.50008L7.99991 11.0001H19.9999Z" fill="#112442"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
