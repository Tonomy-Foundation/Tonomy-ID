// Polyfills for React Native
import 'fast-text-encoding';

import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigation from './src/navigation/Root';
import 'expo-dev-client';
import theme from './src/utils/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <SafeAreaProvider>
                <RootNavigation></RootNavigation>
            </SafeAreaProvider>
        </PaperProvider>
    );
}
