// IMPORTANT: The following 2 packages should be imported in this order:
import './src/utils/polyfill';
import './src/utils/setSettings';
// NOTE: The rest can be imported in any order
import React from 'react';
import 'debug';
import { Provider as PaperProvider } from 'react-native-paper';
import 'expo-dev-client';
import theme from './src/utils/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorHandlerProvider from './src/providers/ErrorHandler';
import { wrap } from './src/utils/sentry';
import InitializeAppProvider from './src/providers/InitializeApp';
import { StatusBar } from 'react-native';

function App() {
    return (
        <PaperProvider theme={theme}>
            <SafeAreaProvider>
                <StatusBar />
                <ErrorHandlerProvider />
                <InitializeAppProvider />
            </SafeAreaProvider>
        </PaperProvider>
    );
}

export default wrap(App);