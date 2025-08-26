// Polyfills for React Native
// reflect-metadata is for typeorm - https://typeorm.io/#installation
import 'reflect-metadata';
// 3x packages are for Veramo - https://veramo.io/docs/react_native_tutorials/react_native_1_setup_identifiers/#prerequisite-configuration
import '@sinonjs/text-encoding';
import 'react-native-get-random-values';
import '@ethersproject/shims';
// WalletConnect
import '@walletconnect/react-native-compat';

// Manual polyfills
import Bluebird from 'bluebird';
import BigInteger from 'big-integer';
import { NETWORK_ERROR_MESSAGE } from './errors';

// @ts-expect-error Promise library type mismatch
global.Promise = Bluebird;

// required for @tonomy/antelope-did-resolver update
// https://github.com/Tonomy-Foundation/Tonomy-ID/pull/757/
if (typeof BigInt === 'undefined') {
    // @ts-expect-error BigInt global type mismatch
    global.BigInt = BigInteger;
}

// required for @wharfkit/contract
if (typeof Symbol === undefined) throw new Error('Symbol is undefined');

if (typeof Symbol === 'function' && !Symbol.asyncIterator) {
    // @ts-expect-error Symbol.asyncIterator global type mismatch
    Symbol.asyncIterator = Symbol.for('Symbol.asyncIterator');
}

/**
 * Mocks no internet connection by overriding fetch and XMLHttpRequest.
 * Call this function to simulate a network failure.
 */
function mockNoInternet() {
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

// To simulate no internet connection, call mockNoInternet();
// mockNoInternet();
