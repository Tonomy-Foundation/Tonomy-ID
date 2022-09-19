// Invariant Violation: "main" has not been registered. This can happen if:
// * Metro (the local dev server) is run from the wrong folder. Check if Metro is running, stop it and restart it in the current project.
// * A module failed to load due to an error and `AppRegistry.registerComponent` wasn't called.
// solved with https://stackoverflow.com/questions/60124435/however-this-package-itself-specifies-a-main-module-field-that-could-not-be-r#comment124190574_60126739

module.exports = {
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: false,
            },
        }),
    },
    resolver: {
        sourceExts: ['jsx', 'js', 'cjs', 'ts', 'tsx'],
    },
};