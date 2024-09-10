import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function ArrowRight(props: SvgProps) {
    let color = theme.colors.success;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.750386 11.0001C0.749921 10.9015 0.769141 10.8039 0.80692 10.7129C0.844699 10.6219 0.900275 10.5393 0.970387 10.4701L5.44039 6.00009L1.00039 1.53009C0.908996 1.38913 0.867575 1.22157 0.882762 1.05427C0.897949 0.886963 0.968866 0.729602 1.08415 0.607406C1.19942 0.48521 1.35239 0.405255 1.51853 0.380355C1.68466 0.355456 1.85435 0.387054 2.00039 0.470086L7.00039 5.47009C7.14084 5.61071 7.21973 5.80134 7.21973 6.00009C7.21973 6.19884 7.14084 6.38946 7.00039 6.53009L2.00039 11.5301C1.85976 11.6705 1.66914 11.7494 1.47039 11.7494C1.27164 11.7494 1.08101 11.6705 0.940386 11.5301C0.809693 11.3854 0.741412 11.1949 0.750386 11.0001Z" fill="${color}"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
