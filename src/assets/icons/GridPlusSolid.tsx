import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function GridPlusSolid(props: SvgProps) {
    let color = theme.colors.black;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }

    const xml = `
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.3242 8.16699H19.8242M19.8242 8.16699H23.3242M19.8242 8.16699V11.667M19.8242 8.16699V4.66699" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.66602 17.033V22.633C4.66602 23.0196 4.97942 23.333 5.36602 23.333H10.966C11.3526 23.333 11.666 23.0196 11.666 22.633V17.033C11.666 16.6464 11.3526 16.333 10.966 16.333H5.36602C4.97942 16.333 4.66602 16.6464 4.66602 17.033Z" fill="${color}" stroke="${color}" stroke-width="1.75"/>
<path d="M4.66602 5.36699V10.967C4.66602 11.3536 4.97942 11.667 5.36602 11.667H10.966C11.3526 11.667 11.666 11.3536 11.666 10.967V5.36699C11.666 4.98036 11.3526 4.66699 10.966 4.66699H5.36602C4.97942 4.66699 4.66602 4.98036 4.66602 5.36699Z" fill="${color}" stroke="${color}" stroke-width="1.75"/>
<path d="M16.333 17.033V22.633C16.333 23.0196 16.6464 23.333 17.033 23.333H22.633C23.0196 23.333 23.333 23.0196 23.333 22.633V17.033C23.333 16.6464 23.0196 16.333 22.633 16.333H17.033C16.6464 16.333 16.333 16.6464 16.333 17.033Z" fill="${color}" stroke="${color}" stroke-width="1.75"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
