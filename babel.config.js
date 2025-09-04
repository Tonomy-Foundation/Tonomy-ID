const path = require('path');

module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            [
                'babel-preset-expo',
                {
                    // eslint-disable-next-line camelcase
                    unstable_transformImportMeta: true,
                },
            ],
        ],
        plugins: [
            'react-native-paper/babel',
            'transform-inline-environment-variables',
            'react-native-reanimated/plugin',
            '@babel/transform-react-jsx-source',
            'babel-plugin-transform-typescript-metadata',
            ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
            ['@babel/plugin-transform-class-properties', { loose: true }],
            ['@babel/plugin-transform-private-methods', { loose: true }],
            [
                'babel-plugin-transform-builtin-extend',
                {
                    globals: ['Error', 'Array'],
                },
                // this will help with extending Error and Array classes
            ],
            [
                'module-resolver',
                {
                    alias: {
                        // fix for https://github.com/decentralized-identity/ethr-did-resolver/issues/186
                        'ethr-did-resolver': path.resolve(__dirname, 'node_modules/ethr-did-resolver/src/index.ts'),
                        // fix for https://github.com/Shopify/flash-list/issues/896
                        tslib: path.resolve(__dirname, 'node_modules/tslib/tslib.es6.js'),
                    },
                },
            ],
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
