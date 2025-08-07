// https://docs.expo.dev/config-plugins/plugins-and-mods/
// https://chafikgharbi.com/expo-android-manifest/
// import { ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';
const { withAndroidManifest } = require('expo/config-plugins');

// Update AndroidManifest.xml found in ./android/app/src/main/AndroidManifest.xml
// Run `yarn run build:prepare && npx expo prebuild` to check the file
const updateAndroidManifest = function (config) {
    return withAndroidManifest(config, async (config) => {
        console.log('Updating AndroidManifest.xml');
        const manifest = config.modResults.manifest;

        // Clean out unwanted foreground service permissions
        manifest['uses-permission'] = (manifest['uses-permission'] || []).filter(
            (perm) => !perm.$['android:name'].startsWith('android.permission.FOREGROUND_SERVICE')
        );

        // Make permissions less open, to fix security vulnerability
        // https://github.com/Tonomy-Foundation/Tonomy-ID/pull/826#issuecomment-1690020984
        // TODO: a better approach would be to change the <receiver> tag to use android:exported="false"
        manifest['uses-permission'] = manifest['uses-permission'].map((perm) => {
            if (
                perm.$['android:name'] === 'com.google.android.c2dm.permission.SEND' ||
                perm.$['android:name'] === 'android.permission.DUMP'
            ) {
                perm.$['android:protectionLevel'] = 'signature';
            }

            return perm;
        });

        return config;
    });
};

module.exports = updateAndroidManifest;
