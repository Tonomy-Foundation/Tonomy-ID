// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// needed to resolve the did-jwt index.cjs file that is withing Tonomy-ID-SDK
config.resolver.sourceExts.push('cjs');

if (process.env.NODE_ENV === 'local') {
    console.log('Setting up local development environment');

    const sdkPath = '../Tonomy-ID-SDK';
    // config.resolver.nodeModulesPath.push(sdkPath);
    config.resolver.resolveRequest = (context, moduleName, platform) => {
        if (moduleName === 'tonomy-id-sdk' || moduleName.startsWith('tonomy-id-sdk')) {
            // Logic to resolve the module name to a file path...
            // NOTE: Throw an error if there is no resolution.
            return {
                filePath: sdkPath + '/dist/index.cjs',
                type: 'sourceFile',
            };
        }

        // Optionally, chain to the standard Metro resolver.
        return context.resolveRequest(context, moduleName, platform);
    };
    config.watchFolders.push(sdkPath);
}

module.exports = config;
