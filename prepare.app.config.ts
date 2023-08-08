import fs from 'fs';
import settings from './src/settings';
import { ExpoConfig } from 'expo/config';
import myPackage from './package.json';

const appInputs = {
    platform: process.env.EXPO_PLATFORM,
    firstTime: process.env.EXPO_FIRST_TIME,
    nodeEnv: process.env.NODE_ENV,
    expoNodeEnv: process.env.EXPO_NODE_ENV,
};

console.log('appInputs', appInputs);
let slug = settings.config.tonomyIdSchema.replace('://', '');

if (appInputs.platform === 'ios' && appInputs.expoNodeEnv === 'demo') {
    console.log('Replacing config for demo with some staging config (iOS only');
    // Deploy staging and demo ios app to the same app store listing
    const config = require('./src/config/config.staging.json');

    slug = config.appName.toLowerCase().replace(/ /g, '-');
    settings.config.expoProjectId = config.expoProjectId;
}

const identifier = 'foundation.tonomy.projects.' + settings.config.tonomyIdSchema.replace('-', '');

// Check if inputs are correct
if (!/^[0-9a-zA-Z ]+$/g.test(settings.config.appName)) throw new Error('Invalid app name ' + settings.config.appName);
if (!/^([.]{1})([0-9a-z.]+)$/g.test(settings.config.accountSuffix))
    throw new Error('Invalid account suffix ' + settings.config.accountSuffix);

const expo: ExpoConfig = {
    scheme: settings.config.tonomyIdSchema,
    name: settings.config.appName,
    slug,
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
    githubUrl: 'https://github.com/Tonomy-Foundation/Tonomy-ID',
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
        EXPO_NODE_ENV: process.env.EXPO_NODE_ENV,
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
