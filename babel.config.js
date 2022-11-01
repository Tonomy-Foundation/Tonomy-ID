module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-paper/babel', 'transform-inline-environment-variables', 'module-resolver',{
      alias :{
        "utils": "./src/utils",
      }
    }],
  };
};
