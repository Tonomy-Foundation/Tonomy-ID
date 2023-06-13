import './src/utils/polyfill';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigation from './src/navigation/Root';
import 'expo-dev-client';
import theme from './src/utils/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import setErrorHandlers from './src/utils/exceptions';
import ErrorHandlerContainer from './src/providers/ErrorHandlerProvider';
import useErrorStore from './src/store/errorStore';
import './src/utils/base64.polyfill';
import { LogBox } from 'react-native';
import settings from './src/settings';
import { runTests } from './src/utils/runtime-tests';

LogBox.ignoreLogs([
    /(Detected alien instance of )[\w]+(, this usually means more than one version of @greymass\/eosio has been included in your bundle)/g,
]);

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
