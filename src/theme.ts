import { DefaultTheme } from 'react-native-paper';
import { Theme } from 'react-native-paper/src/types';
import settings from './settings';

// https://callstack.github.io/react-native-paper/4.0/theming.html
const theme: Theme = {
    ...DefaultTheme,
    dark: true,
    colors: {
        ...DefaultTheme.colors,
        primary: settings.config.theme.primaryColor,
        accent: settings.config.theme.secondaryColor,
        surface: settings.config.theme.tertiaryColor,
        background: 'white',
    },
};

export default theme;
