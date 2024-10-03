import React from 'react';
import { SvgProps, SvgXml } from 'react-native-svg';
import theme from '../../../utils/theme';

export default function SocialIconLinkedIn(props: SvgProps) {
    let color = theme.colors.white;

    if (props.color && typeof props.color === 'string') {
        color = props.color;
    }
    const xml = `
    <svg width="45" height="44" viewBox="0 0 45 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.5 0C10.3484 0 0.5 9.84844 0.5 22C0.5 34.1516 10.3484 44 22.5 44C34.6516 44 44.5 34.1516 44.5 22C44.5 9.84844 34.6516 0 22.5 0ZM16.3469 31.2039H12.0586V17.4797H16.3469V31.2039ZM14.0867 15.7609H14.0523C12.4969 15.7609 11.4914 14.7125 11.4914 13.3805C11.4914 12.0227 12.5312 11 14.1125 11C15.6937 11 16.6648 12.0227 16.6992 13.3805C16.7078 14.7039 15.7023 15.7609 14.0867 15.7609ZM33.5 31.2039H28.6359V24.1055C28.6359 22.2492 27.8797 20.9773 26.2039 20.9773C24.9234 20.9773 24.2102 21.8367 23.8836 22.6617C23.7633 22.9539 23.7805 23.3664 23.7805 23.7875V31.2039H18.9594C18.9594 31.2039 19.0195 18.6227 18.9594 17.4797H23.7805V19.6367C24.0641 18.6914 25.6023 17.3508 28.0602 17.3508C31.1109 17.3508 33.5 19.3273 33.5 23.5727V31.2039Z" fill="black" stroke="black" stroke-width="0.0859375"/>
</svg>
`;

    return <SvgXml {...props} xml={xml} />;
}
