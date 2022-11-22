module.exports = function (api) {
    api.cache.using(() => process.env.NODE_ENV);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-paper/babel',
            'transform-inline-environment-variables',
            'react-native-reanimated/plugin',
        ],
    };
};
