// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
console.log('__dirname', __dirname);

// needed to resolve the did-jwt index.cjs file that is withing Tonomy-ID-SDK
config.resolver.sourceExts.push('cjs');

if (process.env.NODE_ENV === 'local') {
    console.log('Setting up local development environment. Using local Tonomy-ID-SDK.');
    // see https://medium.com/@alielmajdaoui/linking-local-packages-in-react-native-the-right-way-2ac6587dcfa2

    const sdkPath = __dirname + '/../Tonomy-ID-SDK';
    config.resolver.nodeModulesPath = [sdkPath];
    config.watchFolders.push(sdkPath);
}

module.exports = config;
