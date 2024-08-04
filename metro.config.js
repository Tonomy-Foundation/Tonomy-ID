// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// needed to resolve pure ESM packages that are within Tonomy-ID-SDK
config.resolver.unstable_enablePackageExports = true;

if (process.env.EXPO_NODE_ENV === 'local') {
    console.log('Setting up local development environment. Using local Tonomy-ID-SDK.');
    // see https://medium.com/@alielmajdaoui/linking-local-packages-in-react-native-the-right-way-2ac6587dcfa2

    const sdkPath = path.resolve(__dirname, '../Tonomy-ID-SDK');

    config.resolver.nodeModulesPaths.push(sdkPath);
    config.watchFolders.push(sdkPath);
}

module.exports = config;
