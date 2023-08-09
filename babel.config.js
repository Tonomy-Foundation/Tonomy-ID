module.exports = function (api) {
    api.cache(true);
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
