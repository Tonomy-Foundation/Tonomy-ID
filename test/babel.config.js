module.exports = {
    presets: ["@babel/preset-env", '@babel/preset-flow', '@babel/preset-typescript'],
    plugins: [
        // SyntaxError: /home/dev/Documents/Git/Tonomy/Tonomy-ID/src/utils/StorageManager/entities/keyStorage.ts: Support for the experimental syntax 'decorators' isn't currently enabled (4:1):
        ["@babel/plugin-proposal-decorators", { version: "legacy" }],
        // SyntaxError: /home/dev/Documents/Git/Tonomy/Tonomy-ID/src/utils/StorageManager/entities/keyStorage.ts: Definitely assigned fields cannot be initialized here, but only in the constructor
        ["@babel/plugin-transform-class-properties"],
    ]
}