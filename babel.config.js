module.exports = function (api) {
    api.cache(true);
    return {
        presets: [['babel-preset-expo', { lazyImports: true }]],
        plugins: [
            'react-native-paper/babel',
            'transform-inline-environment-variables',
            'react-native-reanimated/plugin',
            '@babel/transform-react-jsx-source',
            'babel-plugin-transform-typescript-metadata',
            '@babel/plugin-syntax-import-assertions',
            [
                'babel-plugin-rewrite-require',
                {
                    aliases: {
                        crypto: 'crypto-browserify',
                        stream: 'stream-browserify',
                    },
                },
            ],
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
        ],
    };
};
