// IMPORTANT: The following 2 packages should be imported in this order:
import './src/utils/polyfill';
import './src/utils/setSettings';
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
import { ErrorBoundary } from 'react-error-boundary';
import { logErrorBoundaryError } from './src/utils/exceptions';
import ErrorFallbackProvider from './src/providers/ErrorFallback';

Debug.enable(process.env.DEBUG);
console.log('DEBUG:', process.env.DEBUG);

function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallbackProvider} onError={logErrorBoundaryError}>
            <PaperProvider theme={theme}>
                <SafeAreaProvider>
                    <ErrorHandlerProvider />
                    <InitializeAppProvider />
                </SafeAreaProvider>
            </PaperProvider>
        </ErrorBoundary>
    );
}

export default wrap(App);
