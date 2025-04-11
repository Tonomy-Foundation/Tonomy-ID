import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function TransactionSuccess(props: SvgProps) {
    let color = theme.colors.primary;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }

    const xml = `
    <svg width="144px" height="144px" viewBox="0 0 144 144" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <pattern id="pattern-0yr2deypcp-1" width="40" height="40" x="12" y="12" patternUnits="userSpaceOnUse">
            <use xlink:href="#image-0yr2deypcp-2" transform="scale(0.1,0.1)"></use>
        </pattern>
        <image id="image-0yr2deypcp-2" width="400" height="400" xlink:href="data:image/png;base64,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"></image>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="31-check-solid-1" fill-rule="nonzero">
            <g id="Group">
                <circle id="Oval" fill="#F4F9FE" cx="72" cy="72" r="72"></circle>
                <circle id="Oval" fill="#E7F1FC" cx="71.5978" cy="71.5989" r="53.095"></circle>
                <circle id="Oval" fill="#DCEBFA" cx="71.5977" cy="71.5989" r="24.1341"></circle>
            </g>
            <rect id="Rectangle" fill="url(#pattern-0yr2deypcp-1)" x="52" y="52" width="40" height="40"></rect>
        </g>
    </g>
</svg>
    `;

    return <SvgXml {...props} xml={xml} />;
}
