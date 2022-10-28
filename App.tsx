// Polyfills for React Native
import 'fast-text-encoding';

import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import MainNavigation from './src/navigation/main';
import 'expo-dev-client';
import theme from './src/theme';
import { throwUnhandled } from './src/utils/errors';

throwUnhandled();

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <MainNavigation></MainNavigation>
        </PaperProvider>
    );
}
