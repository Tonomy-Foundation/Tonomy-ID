// Polyfills for React Native
import 'fast-text-encoding';

import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import MainNavigation from './src/navigation/main';
import 'expo-dev-client';
import theme from './src/utils/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import setErrorHandlers from './src/utils/exceptions';
import ErrorHandlerContainer from './src/components/ErrorHandlerProvider';

setErrorHandlers();

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <SafeAreaProvider>
                <ErrorHandlerContainer>
                    <MainNavigation />
                </ErrorHandlerContainer>
            </SafeAreaProvider>
        </PaperProvider>
    );
}
