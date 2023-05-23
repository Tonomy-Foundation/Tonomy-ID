import { encode as btoa, decode as atob } from 'base-64';

console.log('Setting btoa and atob polyfills');
global.btoa = btoa;
global.atob = atob;
