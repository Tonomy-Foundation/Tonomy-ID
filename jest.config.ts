import type { Config } from 'jest';

// List of node_module packages that Jest should transform
const packagesRegexToTransform = [
    '@?(jest-)?react-native(-community)?',
    '@?expo(nent)?',
    '@expo-google-fonts',
    '@react-navigation',
    '@unimodules',
    'native-base',
    'react-native-svg',
    'argon2',
    '@veramo',
    '@ipld/dag-pb',
    'multiformats',
    'ipfs-unixfs',
    'protons-runtime',
    'uint8-varint',
    'uint8arrays',
    'expo-modules-core',
    'expo-sqlite',
    'expo-asset', // ✅ added to fix import/export syntax errors
    'expo-constants',
];

// Build the transformIgnorePatterns regex
const ignoreRegexString = 'node_modules/(?!(' + packagesRegexToTransform.join('|') + ')/.*)';

console.info('jest.transformIgnorePatterns:', ignoreRegexString);

const config: Config = {
    preset: 'jest-expo',
    transformIgnorePatterns: [ignoreRegexString],
    testEnvironment: 'node',
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
