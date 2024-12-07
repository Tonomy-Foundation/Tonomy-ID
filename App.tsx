// IMPORTANT: The following 2 packages should be imported in this order:
import 'reflect-metadata';
import './src/utils/polyfill';
// NOTE: The rest can be imported in any order
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import 'expo-dev-client';
import theme from './src/utils/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorHandlerProvider from './src/components/ErrorHandlerProvider';
import settings from './src/settings';
import Debug from 'debug';
import { wrap } from './src/utils/sentry';
import { setSettings } from '@tonomy/tonomy-id-sdk';
import InitializeAppProvider from './src/providers/InitializeApp';

Debug.enable(process.env.DEBUG);
console.log('DEBUG:', process.env.DEBUG);

setSettings({
    blockchainUrl: settings.config.blockchainUrl,
    accountSuffix: settings.config.accountSuffix,
    communicationUrl: settings.config.communicationUrl,
    tonomyIdSchema: settings.config.tonomyIdSlug,
    accountsServiceUrl: settings.config.accountsServiceUrl,
    ssoWebsiteOrigin: settings.config.ssoWebsiteOrigin,
});

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
