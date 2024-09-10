import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function DeleteAccountIcon(props: SvgProps) {
    let color = theme.colors.success;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.49316 10.833H9.99317H12.4932" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.53259 3.5776C2.51201 3.42323 2.56585 3.26883 2.69271 3.17851C3.2726 2.76562 5.26177 1.66602 9.99993 1.66602C14.7381 1.66602 16.7273 2.76562 17.3072 3.17851C17.434 3.26883 17.4879 3.42323 17.4673 3.5776L16.0513 14.1975C15.9139 15.228 15.3036 16.1353 14.401 16.6511L14.1344 16.8034C11.5725 18.2674 8.42735 18.2674 5.86544 16.8034L5.59888 16.6511C4.69627 16.1353 4.08598 15.228 3.94859 14.1975L2.53259 3.5776Z" stroke="${color}" stroke-width="1.25"/>
<path d="M2.5 4.16602C4.64286 6.38823 15.3572 6.3882 17.5 4.16602" stroke="${color}" stroke-width="1.25"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
