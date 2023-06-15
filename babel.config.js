module.exports = function (api) {
    api.cache.using(() => process.env.MY_EXPO_ENV);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-paper/babel',
            'transform-inline-environment-variables',
            'react-native-reanimated/plugin',
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
