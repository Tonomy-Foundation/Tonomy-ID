import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../utils/theme';

export default function FingerprintIcon(props: SvgProps) {
    let color = theme.colors.success;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }

    const xml = `
    <svg width="90" height="100" viewBox="0 0 90 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M73.5657 12.9774C73.1724 12.9774 72.7791 12.8791 72.4349 12.6824C62.9949 7.81492 54.8332 5.74992 45.0491 5.74992C35.3141 5.74992 26.0707 8.06075 17.6632 12.6824C16.4832 13.3216 15.0082 12.8791 14.3199 11.6991C13.6807 10.5191 14.1232 8.99492 15.3032 8.35575C24.4482 3.38992 34.4782 0.833252 45.0491 0.833252C55.5216 0.833252 64.6666 3.14409 74.6966 8.30659C75.9258 8.94575 76.3682 10.4208 75.7291 11.6008C75.2866 12.4858 74.4507 12.9774 73.5657 12.9774ZM3.20824 38.7899C2.71657 38.7899 2.22491 38.6424 1.78241 38.3474C0.651573 37.5608 0.405739 36.0366 1.19241 34.9058C6.05991 28.0224 12.2549 22.6141 19.6299 18.8283C35.0682 10.8633 54.8332 10.8141 70.3207 18.7791C77.6957 22.5649 83.8907 27.9241 88.7582 34.7583C89.5449 35.8399 89.2991 37.4133 88.1682 38.1999C87.0374 38.9866 85.5132 38.7408 84.7266 37.6099C80.3016 31.4149 74.6966 26.5474 68.0591 23.1549C53.9482 15.9274 35.9041 15.9274 21.8424 23.2041C15.1557 26.6458 9.55074 31.5624 5.12574 37.7574C4.73241 38.4458 3.99491 38.7899 3.20824 38.7899ZM33.9374 98.1341C33.2982 98.1341 32.6591 97.8883 32.2166 97.3966C27.9391 93.1191 25.6282 90.3658 22.3341 84.4166C18.9416 78.3691 17.1716 70.9941 17.1716 63.0783C17.1716 48.4758 29.6599 36.5774 44.9999 36.5774C60.3399 36.5774 72.8282 48.4758 72.8282 63.0783C72.8282 64.4549 71.7466 65.5366 70.3699 65.5366C68.9932 65.5366 67.9116 64.4549 67.9116 63.0783C67.9116 51.1799 57.6357 41.4941 44.9999 41.4941C32.3641 41.4941 22.0882 51.1799 22.0882 63.0783C22.0882 70.1583 23.6616 76.6974 26.6607 82.0074C29.8074 87.6616 31.9707 90.0708 35.7566 93.9058C36.6907 94.8891 36.6907 96.4133 35.7566 97.3966C35.2157 97.8883 34.5766 98.1341 33.9374 98.1341ZM69.1899 89.0383C63.3391 89.0383 58.1766 87.5633 53.9482 84.6624C46.6224 79.6966 42.2466 71.6333 42.2466 63.0783C42.2466 61.7016 43.3282 60.6199 44.7049 60.6199C46.0816 60.6199 47.1632 61.7016 47.1632 63.0783C47.1632 70.0108 50.7032 76.5499 56.7016 80.5816C60.1924 82.9416 64.2732 84.0724 69.1899 84.0724C70.3699 84.0724 72.3366 83.9249 74.3032 83.5808C75.6307 83.3349 76.9091 84.2199 77.1549 85.5966C77.4007 86.9241 76.5157 88.2024 75.1391 88.4483C72.3366 88.9891 69.8782 89.0383 69.1899 89.0383ZM59.3074 99.1666C59.1107 99.1666 58.8649 99.1174 58.6682 99.0683C50.8507 96.9049 45.7374 94.0041 40.3782 88.7433C33.4949 81.9091 29.7091 72.8133 29.7091 63.0783C29.7091 55.1133 36.4941 48.6233 44.8524 48.6233C53.2107 48.6233 59.9957 55.1133 59.9957 63.0783C59.9957 68.3391 64.5682 72.6166 70.2224 72.6166C75.8766 72.6166 80.4491 68.3391 80.4491 63.0783C80.4491 44.5424 64.4699 29.4974 44.8032 29.4974C30.8399 29.4974 18.0566 37.2658 12.3041 49.3116C10.3866 53.2941 9.40324 57.9649 9.40324 63.0783C9.40324 66.9133 9.74741 72.9608 12.6974 80.8274C13.1891 82.1058 12.5499 83.5316 11.2716 83.9741C9.99324 84.4658 8.56741 83.7774 8.12491 82.5483C5.71574 76.1074 4.53574 69.7158 4.53574 63.0783C4.53574 57.1783 5.66657 51.8191 7.87907 47.1483C14.4182 33.4308 28.9224 24.5316 44.8032 24.5316C67.1741 24.5316 85.3657 41.7891 85.3657 63.0291C85.3657 70.9941 78.5807 77.4841 70.2224 77.4841C61.8641 77.4841 55.0791 70.9941 55.0791 63.0291C55.0791 57.7683 50.5066 53.4908 44.8524 53.4908C39.1982 53.4908 34.6257 57.7683 34.6257 63.0291C34.6257 71.4366 37.8707 79.3033 43.8199 85.2033C48.4907 89.8249 52.9649 92.3816 59.8974 94.2991C61.2249 94.6433 61.9624 96.0199 61.6182 97.2983C61.3724 98.4291 60.3399 99.1666 59.3074 99.1666Z" fill="${color}" fill-opacity="0.54"/>
    </svg>
    `;

    return <SvgXml {...props} xml={xml} />;
}