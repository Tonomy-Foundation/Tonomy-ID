// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname);

config = {
    ...config,
    ...getSentryExpoConfig(__dirname, config),
};

// Needed to resolve pure ESM packages that are within Tonomy-ID-SDK
config.resolver.unstable_enablePackageExports = true;

// Turn on symlinks for local development
config.resolver.unstable_enableSymlinks = true;

if (process.env.EXPO_NODE_ENV === 'local') {
    console.log('Setting up local development environment. Using local Tonomy-ID-SDK.');
    const sdkPath = path.resolve(__dirname, '../Tonomy-ID-SDK');

    config.resolver.nodeModulesPaths.push(sdkPath);
    config.watchFolders.push(sdkPath);

    // Needed to resolve locally in SDK
    config.resolver.extraNodeModules['crypto-browserify'] = path.resolve(__dirname);
    config.resolver.extraNodeModules['stream-browserify'] = path.resolve(__dirname);
}

const debugModulePath = path.resolve(__dirname, 'src/utils/debug.ts');

// Override "debug" imports
config.resolver.resolveRequest = (context, moduleName, platform) => {
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

// SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

module.exports = config;
