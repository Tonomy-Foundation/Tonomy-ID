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
import useErrorStore from './src/store/errorStore';
import * as Linking from 'expo-linking';

export default function App() {
    const errorStore = useErrorStore();
    const url = Linking.useURL();

    if (url) {
        const { hostname, path, queryParams } = Linking.parse(url);
        console.log('hostname', hostname);
        console.log('path', path);
        console.log('queryParams', queryParams);
    }
    setErrorHandlers(errorStore);

    return (
        <PaperProvider theme={theme}>
            <SafeAreaProvider>
                <ErrorHandlerContainer />
                <MainNavigation />
            </SafeAreaProvider>
        </PaperProvider>
    );
}
