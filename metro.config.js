// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// needed to resolve the did-jwt index.cjs file that is withing Tonomy-ID-SDK
config.resolver.sourceExts.push('cjs');

module.exports = config;
