module.exports = function (api) {
    api.cache.using(() => process.env.NODE_ENV);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
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
