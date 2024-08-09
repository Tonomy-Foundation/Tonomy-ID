// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const Debug = require('debug');

const debug = Debug('tonomy-id:metro.config');
const config = getDefaultConfig(__dirname);

// Needed to resolve pure ESM packages that are within Tonomy-ID-SDK
config.resolver.unstable_enablePackageExports = true;

// Turn on symlinks for local development
config.resolver.unstable_enableSymlinks = true;

if (process.env.EXPO_NODE_ENV === 'local') {
    console.log('Setting up local development environment. Using local Tonomy-ID-SDK.');
    // see https://medium.com/@alielmajdaoui/linking-local-packages-in-react-native-the-right-way-2ac6587dcfa2

    const sdkPath = path.resolve(__dirname, '../Tonomy-ID-SDK');

    config.resolver.nodeModulesPaths.push(sdkPath);
    config.watchFolders.push(sdkPath);

    // Need to resolve these babel-plugin-rewrite-require locally as Tonomy-ID-SDK tries to import them from it's directory
    config.resolver.extraNodeModules['crypto-browserify'] = path.resolve(__dirname);
    config.resolver.extraNodeModules['stream-browserify'] = path.resolve(__dirname);
}

debug('Metro config resolver', config.resolver);

module.exports = config;
