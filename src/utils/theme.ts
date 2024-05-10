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
        text: settings.config.theme.text,
        textGray: settings.config.theme.textGray,
        linkColor: settings.config.theme.linkColor,
        info: settings.config.theme.infoBackground,
        lightBg: settings.config.theme.lightBackground,
        white: '#FDFEFF',
        headerFooter: '#F9F9F9',
        grey: '#313938',
        grey1: '#5B6261',
        grey2: '#939393',
        grey3: '#BEBEBE',
        grey4: '#F9F9F9',
        grey5: '#E4E4E4',
        grey6: '#F4F4F4',
        shadow: '#4D4D4D',
        shadowDark: '#000',
        error: '#F44336',
        success: '#4CAF50',
    },
};

export type AppTheme = typeof theme;

export const useAppTheme = () => useTheme() as AppTheme;

export const customColors = {
    success: '#4CAF50',
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
        borderRadius: 8,
    },
    marginTop: {
        marginTop: 12,
    },
});

export default theme;
