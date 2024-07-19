// Polyfills for React Native
import '@sinonjs/text-encoding';
import 'react-native-get-random-values';
import '@ethersproject/shims';

// import 'fast-text-encoding';
import { encode as btoa, decode as atob } from 'base-64';

console.log('Setting btoa and atob polyfills');
global.btoa = btoa;
global.atob = atob;

if (typeof BigInt === 'undefined') {
    global.BigInt = require('big-integer');
}
