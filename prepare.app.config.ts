import fs from 'fs';
import settings from './src/settings';
import { ExpoConfig } from 'expo/config';
import myPackage from './package.json';

const appInputs = {
    platform: process.env.EXPO_PLATFORM ?? 'all',
    firstTime: process.env.EXPO_FIRST_TIME ?? 'false',
    nodeEnv: process.env.NODE_ENV ?? 'development',
    buildProfile: process.env.EXPO_BUILD_PROFILE ?? 'development',
};

console.log('appInputs', appInputs);

const slug = settings.config.appName.toLowerCase().replaceAll(' ', '-');
let identifier = 'foundation.tonomy.projects.' + slug.replaceAll('-', '');

if (appInputs.platform === 'ios' && ['staging', 'demo'].includes(appInputs.buildProfile ?? '')) {
    // Apple deploys staging and demo to the same app and uses the
    // version number with environment tag to differentiate instead within TestFlight
    identifier = 'foundation.tonomy.projects.tonomyidstaging';
}

const version = myPackage.version + appInputs.buildProfile;

// Check if inputs are correct
if (!/^[0-9a-zA-Z ]+$/g.test(settings.config.appName)) throw new Error('Invalid app name ' + settings.config.appName);
if (!/^([.]{1})([0-9a-z.]+)$/g.test(settings.config.accountSuffix))
    throw new Error('Invalid account suffix ' + settings.config.accountSuffix);

const expo: ExpoConfig = {
    scheme: slug,
    name: settings.config.appName,
    slug: slug,
    version: version,
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
        bundleIdentifier: identifier,
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
                icon: settings.config.images.logo1024,
                color: settings.config.theme.primaryColor,
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

// Write app.json
fs.writeFileSync('./app.json', JSON.stringify({ expo }, null, 2));
