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
import { StatusBar } from 'react-native';
import { BackHandler } from 'react-native';

Debug.enable(process.env.DEBUG);
console.log('DEBUG:', process.env.DEBUG);

/**
 * To resolve Getting crashing because RN 0.79 (Expo SDK 53) removed the deprecated API `BackHandler.removeEventListener(...)`.
 * An older copy of `react-native-modal` (coming in via `@hcaptcha/react-native-hcaptcha`) still calls it during unmount.
 * This polyfill restores the legacy `removeEventListener` API and ensures compatibility with libraries expecting it.
 */
(() => {
    const subs = new Map<Function, { remove: () => void }>();
    const add = BackHandler.addEventListener.bind(BackHandler);

    BackHandler.addEventListener = (eventName: any, handler: any) => {
        const sub = add(eventName, handler);

        subs.set(handler, sub);
        return {
            remove() {
                sub?.remove?.();
                subs.delete(handler);
            },
        } as any;
    };

    // @ts-ignore legacy removal polyfill
    if (!BackHandler.removeEventListener) {
        // @ts-ignore
        BackHandler.removeEventListener = (_evt: any, handler: any) => {
            const sub = subs.get(handler);

            sub?.remove?.();
            subs.delete(handler);
        };
    }
})();

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
