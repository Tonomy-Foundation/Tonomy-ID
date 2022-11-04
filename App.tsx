// Polyfills for React Native
import 'fast-text-encoding';

import React from 'react';
import { Portal, Provider as PaperProvider } from 'react-native-paper';
import MainNavigation from './src/navigation/main';
import 'expo-dev-client';
import theme from './src/theme';

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <Portal>
                <MainNavigation></MainNavigation>
            </Portal>
        </PaperProvider>
    );
}
