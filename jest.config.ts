import type { Config } from 'jest';

// List of node_module packages that will be transformed by jest
const packagesRegexToTransform = [
    // Existing packages migrated from package.json::jest.transformIgnorePatterns
    '@?(jest-)?react-native(-community)?',
    '@?expo(nent)?',
    '@expo-google-fonts',
    '@react-navigation',
    '@unimodules',
    'native-base',
    'react-native-svg',
    'argon2',
    /*
        /home/dev/Documents/Git/Tonomy/Tonomy-ID/node_modules/multiformats/dist/src/basics.js:1
    ({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,jest){import * as base10 from './bases/base10.js';
                                                                                      ^^^^^^
    SyntaxError: Cannot use import statement outside a module
    */
    '@veramo',
    '@ipld/dag-pb',
    'multiformats',
    'ipfs-unixfs',
    'protons-runtime',
    'uint8-varint',
    'uint8arrays',
    'expo-modules-core',
    'expo-asset',
    /*
    /home/dev/Documents/Git/Tonomy/Tonomy-ID/node_modules/expo-sqlite/build/index.js:1
    ({"Object.<anonymous>":function(module,exports,require,__dirname,__filename,jest){export * from './SQLite';
                                                                                      ^^^^^^
    SyntaxError: Unexpected token 'export'
    */
    'expo-sqlite',

    'expo-constants',
];

// One big regex string to ignore several packages from not being transformed
// Aka these ARE transformed (despite normally being ignored because they are in node_modules)
const ignoreRegexString = 'node_modules/(?!(' + packagesRegexToTransform.join('|') + ')/.*)';

console.info('jest.transformIgnorePatterns:', ignoreRegexString);

const config: Config = {
    preset: 'jest-expo',
    transformIgnorePatterns: [ignoreRegexString],
    testEnvironment: 'node',
    // Cannot find module ... from ...
    moduleNameMapper: {
        '^@ipld/dag-pb$': '<rootDir>/node_modules/@ipld/dag-pb/src/index.js',
        '^multiformats/(.*)$': '<rootDir>/node_modules/multiformats/esm/src/$1',
        '^ipfs-unixfs$': '<rootDir>/node_modules/ipfs-unixfs/dist/src/index.js',
        '^protons-runtime$': '<rootDir>/node_modules/protons-runtime/dist/src/index.js',
        '^uint8-varint$': '<rootDir>/node_modules/uint8-varint/dist/src/index.js',
        '^uint8arrays$': '<rootDir>/node_modules/uint8arrays/index.js',
    },
    setupFiles: ['./jest.setup.js'],
};

export default config;
