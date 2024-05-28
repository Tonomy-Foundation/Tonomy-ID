import 'reflect-metadata';
import '@walletconnect/react-native-compat';
import './src/utils/polyfill';
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

if (!settings.isProduction()) {
    runTests();
}

export default function App() {
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
