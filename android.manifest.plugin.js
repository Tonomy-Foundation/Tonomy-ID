const { withAndroidManifest } = require('expo/config-plugins');

const updateAndroidManifest = function (config) {
    return withAndroidManifest(config, async (config) => {
        console.log('Updating AndroidManifest.xml');
        const manifest = config.modResults.manifest;

        // Clean out unwanted foreground service permissions
        manifest['uses-permission'] = (manifest['uses-permission'] || []).filter(
            (perm) => !perm.$['android:name'].startsWith('android.permission.FOREGROUND_SERVICE')
        );

        // Fix security vulnerability
        manifest['uses-permission'] = manifest['uses-permission'].map((perm) => {
            if (
                perm.$['android:name'] === 'com.google.android.c2dm.permission.SEND' ||
                perm.$['android:name'] === 'android.permission.DUMP'
            ) {
                perm.$['android:protectionLevel'] = 'signature';
            }

            return perm;
        });

        // ✅ Add or override the ML Kit dependency meta-data
        if (!manifest.application[0]['meta-data']) {
            manifest.application[0]['meta-data'] = [];
        }

        // remove any existing entry for com.google.mlkit.vision.DEPENDENCIES
        manifest.application[0]['meta-data'] = manifest.application[0]['meta-data'].filter(
            (m) => m.$['android:name'] !== 'com.google.mlkit.vision.DEPENDENCIES'
        );

        // add our override
        manifest.application[0]['meta-data'].push({
            $: {
                'android:name': 'com.google.mlkit.vision.DEPENDENCIES',
                'android:value': 'barcode_ui,face', //TODO: update this
                'tools:replace': 'android:value',
            },
        });

        // make sure tools namespace exists in manifest root
        if (!manifest.$['xmlns:tools']) {
            manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        return config;
    });
};

module.exports = updateAndroidManifest;
