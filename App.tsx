// IMPORTANT: The following 2 packages should be imported in this order:
import './src/utils/polyfill';
import './src/settings';
// NOTE: The rest can be imported in any order
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import 'expo-dev-client';
import theme from './src/utils/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorHandlerProvider from './src/providers/ErrorHandler';
import Debug from 'debug';
import { wrap } from './src/utils/sentry';
import InitializeAppProvider from './src/providers/InitializeApp';

Debug.enable(process.env.DEBUG);
console.log('DEBUG:', process.env.DEBUG);

function App() {
    return (
        <PaperProvider theme={theme}>
            <SafeAreaProvider>
                <ErrorHandlerProvider />
                <InitializeAppProvider />
            </SafeAreaProvider>
        </PaperProvider>
    );
}

export default wrap(App);
