module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-paper/babel',
            'transform-inline-environment-variables',
            [
                'module-resolver',
                {
                    root: ['.'],
                    extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                    alias: {
                        '@': './src/components',
                        utils: './src/utils',
                        sdk: 'tonomy-id-sdk',
                    },
                },
            ],
        ],
        env: {
            designonly: {
                plugins: [['module-resolver', { alias: { sdk: './src/utils/mockSDK' } }]],
            },
        },
    };
};
