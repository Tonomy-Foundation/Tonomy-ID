import { Platform, StyleSheet } from 'react-native';
import { DefaultTheme, useTheme } from 'react-native-paper';

import settings from '../settings';

// https://callstack.github.io/react-native-paper/4.0/theming.html
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const theme = {
    ...DefaultTheme,
    dark: false, // as we are using light theme this should be false
    colors: {
        ...DefaultTheme.colors,
        primary: settings.config.theme.primaryColor,
        primary2: settings.config.theme.primaryColor2,
        secondary: settings.config.theme.secondaryColor,
        secondary2: settings.config.theme.secondaryColor2,
        accent: settings.config.theme.tertiaryColor,
        accent2: settings.config.theme.tertiaryColor2,
        background: 'white',
        text: '#474D4C',
        textGray: '#868686',
        white: '#FDFEFF',
        headerFooter: '#F9F9F9',
    },
};

export type AppTheme = typeof theme;

export const useAppTheme = () => useTheme() as AppTheme;

export const customColors = {
    disabledButtonTextColor: 'darkgrey',
    success: '#4CAF50',
    textBold: '#272727',
};

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
        borderRadius: 20,
    },
    marginTop: {
        marginTop: 12,
    },
});

export default theme;
