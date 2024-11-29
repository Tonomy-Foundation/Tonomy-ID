// IMPORTANT: The following 2 packages should be imported in this order:
import 'reflect-metadata';
import './src/utils/polyfill';
// NOTE: The rest can be imported in any order
import '@walletconnect/react-native-compat';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigation from './src/navigation/Root';
import 'expo-dev-client';
import theme from './src/utils/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import setErrorHandlers from './src/utils/exceptions';
import ErrorHandlerContainer from './src/components/ErrorHandlerProvider';
import useErrorStore from './src/store/errorStore';
import settings from './src/settings';
import { runTests } from './src/utils/runtime-tests';
import Debug from 'debug';
import * as Sentry from '@sentry/react-native';

import './src/utils/sentry';

Debug.enable(process.env.DEBUG);

if (!settings.isProduction()) {
    runTests();
}

function App() {
    const errorStore = useErrorStore();

    setErrorHandlers(errorStore);

    return (
        <PaperProvider theme={theme}>
            <SafeAreaProvider>
                <ErrorHandlerContainer />
                <RootNavigation />
            </SafeAreaProvider>
        </PaperProvider>
    );
}

export default Sentry.wrap(App);
