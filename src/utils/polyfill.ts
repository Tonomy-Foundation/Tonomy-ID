// Polyfills for React Native
// reflect-metadata is for typeorm - https://typeorm.io/#installation
import 'reflect-metadata';
// 3x packages are for Veramo - https://veramo.io/docs/react_native_tutorials/react_native_1_setup_identifiers/#prerequisite-configuration
import '@sinonjs/text-encoding';
import 'react-native-get-random-values';
import '@ethersproject/shims';
// WalletConnect
import '@walletconnect/react-native-compat';
import { BackHandler } from 'react-native';

console.log('Polyfills: Adding reflect-metadata');
console.log('Polyfills: Adding sinonjs/text-encoding');
console.log('Polyfills: Adding react-native-get-random-values');
console.log('Polyfills: Adding @ethersproject/shims');
console.log('Polyfills: Adding @walletconnect/react-native-compat');

// Manual polyfills
import Bluebird from 'bluebird';
import BigInteger from 'big-integer';
import { NETWORK_ERROR_MESSAGE } from './errors';

console.log('Polyfills: Adding Promise');
// @ts-expect-error Promise library type mismatch
global.Promise = Bluebird;

// required for @tonomy/antelope-did-resolver update
// https://github.com/Tonomy-Foundation/Tonomy-ID/pull/757/
if (typeof BigInt === 'undefined') {
    console.log('Polyfills: Adding BigInt');
    // @ts-expect-error BigInt global type mismatch
    global.BigInt = BigInteger;
}

// required for @wharfkit/contract
if (typeof Symbol === undefined) throw new Error('Symbol is undefined');

if (typeof Symbol === 'function' && !Symbol.asyncIterator) {
    console.log('Polyfills: Adding Symbol.asyncIterator');
    // @ts-expect-error Symbol.asyncIterator global type mismatch
    Symbol.asyncIterator = Symbol.for('Symbol.asyncIterator');
}

/**
 * Mocks no internet connection by overriding fetch and XMLHttpRequest.
 * Call this function to simulate a network failure.
 */
function mockNoInternet() {
    console.log('Polyfills: Mocking no internet connection');
    // Save the original fetch function
    const originalFetch = global.fetch;

    global.fetch = async (url, options) => {
        await originalFetch(url, options);
        throw new Error(NETWORK_ERROR_MESSAGE);
    };

    if (global.XMLHttpRequest) {
        const OriginalXMLHttpRequest = global.XMLHttpRequest;

        class CustomXMLHttpRequest extends OriginalXMLHttpRequest {
            constructor() {
                super();
                throw new Error(NETWORK_ERROR_MESSAGE);
            }
        }

        global.XMLHttpRequest = CustomXMLHttpRequest;
    } else {
        console.warn('XMLHttpRequest is not available in this environment');
    }
}

/**
 * To resolve Getting crashing because RN 0.79 (Expo SDK 53) removed the deprecated API `BackHandler.removeEventListener(...)`.
 * An older copy of `react-native-modal` (coming in via `@hcaptcha/react-native-hcaptcha`) still calls it during unmount.
 * This polyfill restores the legacy `removeEventListener` API and ensures compatibility with libraries expecting it.
 */
(() => {
    type BackPressHandler = () => boolean;
    const subs = new Map<BackPressHandler, { remove: () => void }>();
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

    // @ts-ignore legacy removeEventListener polyfill
    if (!BackHandler.removeEventListener) {
        // @ts-ignore legacy removeEventListener polyfill
        BackHandler.removeEventListener = (_evt: any, handler: any) => {
            const sub = subs.get(handler);

            sub?.remove?.();
            subs.delete(handler);
        };
    }
})();

// To simulate no internet connection, call mockNoInternet();
// mockNoInternet();
