const path = require('path');

module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            [
                'babel-preset-expo',
                {
                    // Required for SDK 53 (handles import.meta in ESM modules)
                    // eslint-disable-next-line camelcase
                    unstable_transformImportMeta: true,
                },
            ],
        ],
        plugins: [
            // UI / RN plugins
            'react-native-paper/babel',
            'transform-inline-environment-variables',
            'react-native-reanimated/plugin',

            // Debugging
            '@babel/transform-react-jsx-source',

            // TS + decorators
            'babel-plugin-transform-typescript-metadata',
            ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
            ['@babel/plugin-transform-class-properties', { loose: true }],
            ['@babel/plugin-transform-private-methods', { loose: true }],

            // Help extending built-in classes
            [
                'babel-plugin-transform-builtin-extend',
                {
                    globals: ['Error', 'Array'],
                },
            ],

            // Module resolution hacks
            [
                'module-resolver',
                {
                    alias: {
                        // Fix for https://github.com/decentralized-identity/ethr-did-resolver/issues/186
                        'ethr-did-resolver': path.resolve(__dirname, 'node_modules/ethr-did-resolver/src/index.ts'),
                        // Fix for https://github.com/Shopify/flash-list/issues/896
                        tslib: path.resolve(__dirname, 'node_modules/tslib/tslib.es6.js'),
                    },
                },
            ],

            // Rewrite Node builtins
            [
                'babel-plugin-rewrite-require',
                {
                    aliases: {
                        crypto: 'crypto-browserify',
                        stream: 'stream-browserify',
                    },
                },
            ],
        ],
    };
};
