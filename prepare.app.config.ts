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
let slug = settings.config.tonomyIdSlug.replace('://', '');
const scheme = slug;

console.log('scheme', scheme);

if (appInputs.platform === 'ios' && appInputs.expoNodeEnv === 'staging') {
    console.log('Replacing config for demo with some staging config (iOS only');
    // Deploy staging and testnet ios app to the same app store listing
    const config = require('./src/config/config.staging.json');

    // Expo slug, and bundleIdentifier must be the same for the same app store listing
    slug = config.appName.toLowerCase().replace(/ /g, '-');
    // Match the projectId of staging to make the same build
    settings.config.expoProjectId = config.expoProjectId;
}

if (appInputs.platform === 'ios' && appInputs.expoNodeEnv === 'testnet') {
    console.log('Replacing config for demo with some testnet config (iOS only');
    // Deploy staging and testnet ios app to the same app store listing
    const config = require('./src/config/config.testnet.json');

    // Expo slug, and bundleIdentifier must be the same for the same app store listing
    slug = config.appName.toLowerCase().replace(/ /g, '-');
    // Match the projectId of staging to make the same build
    settings.config.expoProjectId = config.expoProjectId;
}

const identifier = 'foundation.tonomy.projects.' + slug.replace(/-/g, '');

// Check if inputs are correct
if (!/^[0-9a-zA-Z ]+$/g.test(settings.config.appName)) throw new Error('Invalid app name ' + settings.config.appName);
if (!/^([.]{1})([0-9a-z.]+)$/g.test(settings.config.accountSuffix))
    throw new Error('Invalid account suffix ' + settings.config.accountSuffix);

const expo: ExpoConfig = {
    scheme,
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
        infoPlist: {
            NSCameraUsageDescription: 'We need access to your camera to scan the QR code.',
            LSApplicationQueriesSchemes: ['esr'],
            CFBundleURLTypes: [
                {
                    CFBundleURLSchemes: ['esr', 'wc'],
                },
            ],
        },
    },
    android: {
        adaptiveIcon: {
            foregroundImage: settings.config.images.logo1024,
            backgroundColor: '#FFFFFF',
        },
        allowBackup: false,
        package: identifier,
        intentFilters: [
            {
                action: 'VIEW',
                data: [
                    {
                        scheme: 'esr',
                    },
                    {
                        scheme: 'wc',
                    },
                ],
                category: ['BROWSABLE', 'DEFAULT'],
            },
        ],
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
        [
            'expo-build-properties',
            {
                android: {
                    compileSdkVersion: 34,
                    targetSdkVersion: 34,
                    buildToolsVersion: '34.0.0',
                },
                ios: {
                    deploymentTarget: '13.4',
                },
            },
        ],
        ['./android.manifest.plugin.js'],
    ],
    extra: {
        eas: {
            projectId: settings.config.expoProjectId,
        },
        EXPO_NODE_ENV: process.env.EXPO_NODE_ENV,
        DEBUG: process.env.DEBUG,
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
