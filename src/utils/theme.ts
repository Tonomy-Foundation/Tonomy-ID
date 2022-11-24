import { DefaultTheme } from 'react-native-paper';
import { Theme } from 'react-native-paper/src/types';
import settings from '../settings';

// https://callstack.github.io/react-native-paper/4.0/theming.html
const theme: Theme = {
    ...DefaultTheme,
    dark: false, // as we are using light theme this should be false
    colors: {
        ...DefaultTheme.colors,
        primary: settings.config.theme.primaryColor,
        accent: settings.config.theme.secondaryColor,
        background: 'white',
        text: '#BEBEBE',
    },
};

export const customColors = {
    disabledButtonTextColor: 'darkgrey',
    success: '#4CAF50',
    textBold: '#272727',
};

export default theme;
