// Polyfills for React Native

// Required for React Native to work with Veramo
// Source: https://veramo.io/docs/react_native_tutorials/react_native_1_setup_identifiers
import '@sinonjs/text-encoding';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { NETWORK_ERROR_MESSAGE } from './errors';

// required for @tonomy/antelope-did-resolver update
// https://github.com/Tonomy-Foundation/Tonomy-ID/pull/757/
if (typeof BigInt === 'undefined') {
    global.BigInt = require('big-integer');
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
