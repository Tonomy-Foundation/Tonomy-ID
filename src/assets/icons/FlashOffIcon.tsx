import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function FlashOffIcon(props: SvgProps) {
    let color = theme.colors.primary;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }

    const xml = `
    <svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_9187_8740)">
<rect x="1.50029" y="1.66728" width="40.0001" height="40.0001" rx="5.83309" stroke="#FDFEFF" stroke-width="1.6666"/>
<path d="M14.5547 23.9826L18.0269 27.4549V33.2419H24.9713V27.4549L28.4435 23.9826V18.1956H14.5547V23.9826ZM20.3417 10.0938H22.6565V13.566H20.3417V10.0938ZM11.6611 14.5787L13.2977 12.941L15.7514 15.397L14.1148 17.0347L11.6611 14.5787ZM27.2398 15.4005L29.697 12.9468L31.3336 14.5833L28.8776 17.0382L27.2398 15.4005Z" fill="#FDFEFF"/>
</g>
<defs>
<clipPath id="clip0_9187_8740">
<rect width="41.6667" height="41.6667" fill="white" transform="translate(0.666992 0.833984)"/>
</clipPath>
</defs>
</svg>
    `;

    return <SvgXml {...props} xml={xml} />;
}
