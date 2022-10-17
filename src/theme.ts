import { DefaultTheme } from 'react-native-paper';
import { Theme } from 'react-native-paper/src/types';

const theme: Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: 'yellow',
        background: 'green',
    },
};

export default theme;
