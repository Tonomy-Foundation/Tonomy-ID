/* eslint-disable camelcase */
// Learn more: https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname);

// Integrate Sentry
config = getSentryExpoConfig(__dirname);

// Enable ESM package resolution for local SDKs if needed
config.resolver.unstable_enablePackageExports = true;

// Add wasm asset support
config.resolver.assetExts.push('wasm');

// Add COEP and COOP headers to support SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
    return (req, res, next) => {
        res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        middleware(req, res, next);
    };
};

// Enable symlinks for monorepo/local development
config.resolver.unstable_enableSymlinks = true;

if (process.env.EXPO_NODE_ENV === 'local') {
    console.log('Setting up local development environment. Using local Tonomy-ID-SDK.');

    const sdkPath = path.resolve(__dirname, '../Tonomy-ID-SDK');

    // Resolve modules from local SDK and watch for changes
    config.resolver.nodeModulesPaths.push(sdkPath);
    config.watchFolders.push(sdkPath);

    // Ensure required Node modules are resolved locally
    config.resolver.extraNodeModules['crypto-browserify'] = path.resolve(__dirname);
    config.resolver.extraNodeModules['stream-browserify'] = path.resolve(__dirname);
}

// Redirect all imports of "debug" to your internal debug module
const debugModulePath = path.resolve(__dirname, 'src/utils/debug.ts');

config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'debug' && context.originModulePath !== debugModulePath) {
        console.log(`Resolving debug module from ${context.originModulePath}`);
        return context.resolveRequest(context, debugModulePath, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
};

// Configure SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

console.log('Metro config resolver:', config.resolver);

module.exports = config;
