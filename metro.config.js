// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname);

config = getSentryExpoConfig(__dirname);

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

const debugModulePath = path.resolve(__dirname, 'src/utils/debug.ts');

// For all app code, and imported libraries
// if they import the "debug" package
// this should be instead use the ./src/utils/debugAndLog.ts
// so that we can send the logs to Sentry
config.resolver.resolveRequest = (context, moduleName, platform) => {
    // if the module is debug and not importing from the src/utils/debug.ts file
    if (moduleName === 'debug') {
        console.log(`Resolving debug module from ${context.originModulePath}`);

        if (context.originModulePath !== debugModulePath) {
            return context.resolveRequest(context, debugModulePath, platform);
        } else {
            console.log(`>> Skipping debug module resolution from ${context.originModulePath}`);
        }
    }

    return context.resolveRequest(context, moduleName, platform);
};
// config.resolver.extraNodeModules.debug = path.resolve(__dirname, 'src/utils/debugAndLog.ts');

console.log('Metro config resolver', config.resolver);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');
module.exports = config;
