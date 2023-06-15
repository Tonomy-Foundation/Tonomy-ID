import { ExpoConfig } from 'expo/config';

import settings from './build/settings.j';
import myPackage from './package.json';

const slug = settings.config.appName.toLowerCase().replaceAll(' ', '-');
const identifier = 'foundation.tonomy.projects.' + slug.replaceAll('-', '');

// Check if inputs are correct
if (!/^[0-9a-zA-Z ]+$/g.test(settings.config.appName)) throw new Error('Invalid app name ' + settings.config.appName);
if (!/^([.]{1})([0-9a-z.]+)$/g.test(settings.config.accountSuffix))
    throw new Error('Invalid account suffix ' + settings.config.accountSuffix);

const expo: ExpoConfig = {
    scheme: slug,
    name: settings.config.appName,
    slug: slug,
    version: myPackage.version,
    orientation: 'portrait',
    icon: settings.config.images.logo1024,
    userInterfaceStyle: 'light',
    splash: {
        image: settings.config.images.splash,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
    },
    updates: {
        fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'foundation.tonomy.tonomyid',
    },
    android: {
        adaptiveIcon: {
            foregroundImage: settings.config.images.logo1024,
            backgroundColor: '#FFFFFF',
        },
        versionCode: 1,
        package: identifier,
    },
    web: {
        favicon: settings.config.images.logo48,
    },
    plugins: [
        [
            'expo-notifications',
            {
                icon: './src/assets/tonomy/tonomy-logo1024.png',
                color: '#67D7ED',
            },
        ],
    ],
    extra: {
        eas: {
            projectId: '48982c5e-41ff-4858-80ea-8e1b64092f21',
        },
    },
};

if (!['development', 'designonly'].includes(settings.env)) {
    console.log('Replacing expoProjectId');
    if (!expo.extra) expo.extra = {};
    if (!expo.extra.eas) expo.extra.eas = {};
    expo.extra.eas.projectId = settings.config.expoProjectId;
}

if (process.env.EXPO_FIRST_TIME === 'true') {
    console.log('Setting up expo for the first time');
    // @ts-expect-error expo.extra is possibly not defined
    expo.extra.eas = {};
}

console.log(JSON.stringify(expo, null, 2));

export default expo;
