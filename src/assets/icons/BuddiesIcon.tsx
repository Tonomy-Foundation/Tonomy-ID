import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import { customColors } from '../../utils/theme';

export default function BuddiesIcon(props: SvgProps) {
    const color = props.color ? props.color : customColors.success;
    const xml = `
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 7C15.88 7 16.99 5.88 16.99 4.5C16.99 3.12 15.88 2 14.5 2C13.12 2 12 3.12 12 4.5C12 5.88 13.12 7 14.5 7ZM7 6C8.66 6 9.99 4.66 9.99 3C9.99 1.34 8.66 0 7 0C5.34 0 4 1.34 4 3C4 4.66 5.34 6 7 6ZM14.5 9C12.67 9 9 9.92 9 11.75V14H20V11.75C20 9.92 16.33 9 14.5 9ZM7 8C4.67 8 0 9.17 0 11.5V14H7V11.75C7 10.9 7.33 9.41 9.37 8.28C8.5 8.1 7.66 8 7 8Z" fill="black" fill-opacity="0.54"/>
    </svg>
    `;

    return <SvgXml {...props} xml={xml} />;
}
