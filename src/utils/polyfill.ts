// Polyfills for React Native

// Required for React Native to work with Veramo
// Source: https://veramo.io/docs/react_native_tutorials/react_native_1_setup_identifiers
import '@sinonjs/text-encoding';
import 'react-native-get-random-values';
import '@ethersproject/shims';

if (typeof BigInt === 'undefined') {
    global.BigInt = require('big-integer');
}
