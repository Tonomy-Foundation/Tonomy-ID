import { Platform, StyleSheet } from 'react-native';
import { MD2LightTheme as DefaultTheme, MD2Theme, useTheme } from 'react-native-paper';
import settings from '../settings';
import { MD2Colors } from 'react-native-paper/lib/typescript/types';

type ExtendedMD2Colors = MD2Colors & {
    secondary: string;
    secondary2: string;
    accent: string;
    accent2: string;
    textGray: string;
    linkColor: string;
    info: string;
    lightBg: string;
    white: string;
    black: string;
    headerFooter: string;
    grey: string;
    grey1: string;
    grey2: string;
    grey3: string;
    grey4: string;
    grey5: string;
    grey6: string;
    grey7: string;
    grey8: string;
    grey9: string;
    gray10: string;
    shadow: string;
    shadowDark: string;
    success: string;
    errorBackground: string;
    backgroundGray: string;
    tabGray: string;
    border: string;
    blue: string;
    gold: string;
    blue1: string;
    blue2: string;
    warning: string;
    purple: string;
};

type ExtendedMD2Theme = MD2Theme & {
    colors: ExtendedMD2Colors;
};

// https://callstack.github.io/react-native-paper/4.0/theming.html
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const theme: ExtendedMD2Theme = {
    ...DefaultTheme,
    dark: false, // as we are using light theme this should be false
    colors: {
        ...DefaultTheme.colors,
        primary: settings.config.theme.primaryColor,
        disabled: settings.config.theme.disabled,
        secondary: settings.config.theme.secondaryColor,
        secondary2: settings.config.theme.secondaryColor2,
        accent: settings.config.theme.tertiaryColor,
        accent2: settings.config.theme.tertiaryColor2,
        background: 'white',
        text: settings.config.theme.text,
        textGray: settings.config.theme.textGray,
        linkColor: settings.config.theme.linkColor,
        info: settings.config.theme.infoBackground,
        lightBg: settings.config.theme.lightBackground,
        white: '#FDFEFF',
        black: '#000',
        headerFooter: '#F9F9F9',
        grey: '#313938',
        grey1: '#5B6261',
        grey2: '#939393',
        grey3: '#BEBEBE',
        grey4: '#F9F9F9',
        grey5: '#E4E4E4',
        grey6: '#F4F4F4',
        grey7: '#F6F9FB',
        grey8: '#D2DDEC',
        grey9: '#6E84A3',
        gray10: '#3F3F40',
        shadow: '#4D4D4D',
        shadowDark: '#000',
        error: '#F44336',
        success: '#4CAF50',
        errorBackground: '#F443361A',
        backgroundGray: '#EDF2F9',
        tabGray: '#607EAA',
        border: '#E6ECF4',
        blue: '#007BFF',
        gold: '#D9B701',
        blue1: '#00AEED',
        blue2: '#007BB5',
        warning: '#FF96351A',
        purple: '#5833BC',
    } as ExtendedMD2Colors,
};

export type AppTheme = ExtendedMD2Theme;

export const useAppTheme = () => useTheme() as AppTheme;

export const commonStyles = StyleSheet.create({
    alignItemsCenter: {
        alignItems: 'center',
    },
    textAlignCenter: {
        textAlign: 'center',
    },
    marginBottom: {
        marginBottom: 16,
    },
    marginTopTextCenter: {
        marginTop: 16,
        textAlign: 'center',
    },
    borderRadius: {
        borderRadius: 8,
    },
    marginTop: {
        marginTop: 12,
    },
    primaryFontFamily: {
        fontFamily: 'Inter',
    },
    secondaryFontFamily: {
        fontFamily: 'Roboto',
    },
});

export default theme;
