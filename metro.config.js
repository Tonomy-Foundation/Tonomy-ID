// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// needed to resolve the did-jwt index.cjs file that is within Tonomy-ID-SDK
config.resolver.sourceExts.push('cjs');
// for Veramo library https://veramo.io/docs/react_native_tutorials/react_native_1_setup_identifiers
config.resolver.unstable_enablePackageExports = true;

if (process.env.EXPO_NODE_ENV === 'local') {
    console.log('Setting up local development environment. Using local Tonomy-ID-SDK.');
    // see https://medium.com/@alielmajdaoui/linking-local-packages-in-react-native-the-right-way-2ac6587dcfa2

    const sdkPath = __dirname + '/../Tonomy-ID-SDK';

    config.resolver.nodeModulesPath = [sdkPath];
    config.watchFolders.push(sdkPath);
}

module.exports = config;
