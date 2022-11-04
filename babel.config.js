module.exports = function (api) {
    api.cache(true);
    return {
        env: {
            designonly: {
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
                                sdk: './src/utils/mockSDK',
                            },
                        },
                    ],
                ],
            },

            development: {
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
                                sdk: 'tonomy-id-sdkkkk',
                            },
                        },
                    ],
                ],
            },
            production: {
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
            },
        },
    };
};
