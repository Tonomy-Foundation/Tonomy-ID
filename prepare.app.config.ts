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
const slug = settings.config.tonomyIdSlug.replace('://', '');
const scheme = slug;

console.log('scheme', scheme);

if (appInputs.platform === 'ios' && appInputs.expoNodeEnv === 'staging') {
    console.log('Replacing config for demo with some staging config (iOS only');
    // Deploy staging and testnet ios app to the same app store listing
    const config = require('./src/config/config.staging.json');

    // Match the projectId of staging to make the same build
    settings.config.expoProjectId = config.expoProjectId;
}

if (appInputs.platform === 'ios' && appInputs.expoNodeEnv === 'testnet') {
    console.log('Replacing config for demo with some testnet config (iOS only');
    // Deploy staging and testnet ios app to the same app store listing
    const config = require('./src/config/config.testnet.json');

    // Match the projectId of staging to make the same build
    settings.config.expoProjectId = config.expoProjectId;
}

const identifier = 'foundation.tonomy.projects.' + slug.replace(/-/g, '');

// Check if inputs are correct
if (!/^[0-9a-zA-Z ]+$/g.test(settings.config.appName)) throw new Error('Invalid app name ' + settings.config.appName);
if (!/^([.]{1})([0-9a-z.]+)$/g.test(settings.config.accountSuffix))
    throw new Error('Invalid account suffix ' + settings.config.accountSuffix);

const ssoDomainUrl = settings.config.ssoWebsiteOrigin.replace(/^https?:\/\//, '');
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
            LSApplicationQueriesSchemes: ['esr', 'wc', 'did'],
            CFBundleURLTypes: [
                {
                    CFBundleURLSchemes: ['esr', 'wc', 'did'],
                },
            ],
        },
        associatedDomains: [`applinks:${ssoDomainUrl}`],
    },
    android: {
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
                    {
                        scheme: 'did',
                    },
                ],
                category: ['BROWSABLE', 'DEFAULT'],
            },
            {
                action: 'VIEW',
                data: {
                    scheme: 'https',
                    host: ssoDomainUrl,
                    pathPrefix: '/login',
                },
                category: ['BROWSABLE', 'DEFAULT'],
                autoVerify: true, // only works in EAS Build ensures Android tries to verify your domain when the app installs.
            },
        ],
    },
    web: {
        favicon: settings.config.images.logo48,
    },
    plugins: [
        [
            'expo-sqlite',
            {
                enableFTS: true,
                useSQLCipher: true,
                android: {
                    // Override the shared configuration for Android
                    enableFTS: false,
                    useSQLCipher: false,
                },
                ios: {
                    // You can also override the shared configurations for iOS
                    customBuildFlags: ['-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1'],
                },
            },
        ],
        [
            'expo-camera',
            {
                cameraPermission: 'Allow tonomy id to access your camera',
            },
        ],
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
                    compileSdkVersion: 35,
                    targetSdkVersion: 35,
                    buildToolsVersion: '35.0.0',
                    minSdkVersion: 26,
                    extraMavenRepos: [
                        {
                            url: 'https://cdn.veriff.me/android/',
                        },
                    ],
                    ndkVersion: '27.0.12077973',
                    extraLdflags: ['-Wl,-z,max-page-size=16384'],
                },
                ios: {
                    deploymentTarget: '15.1',
                },
            },
        ],
        ['./android.manifest.plugin.js'],
        [
            '@sentry/react-native/expo',
            {
                organization: 'tonomy-foundation-ba',
                project: settings.config.sentryProjectId,
                url: 'https://sentry.io/',
            },
        ],
        [
            '@veriff/react-native-sdk',
            {
                androidMavenRepoUrl: 'https://cdn.veriff.me/android/',
            },
        ],
    ],
    extra: {
        eas: {
            projectId: settings.config.expoProjectId,
        },
        EXPO_NODE_ENV: process.env.EXPO_NODE_ENV,
        DEBUG: process.env.DEBUG,
        INFURA_KEY: process.env.INFURA_KEY,
        ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
        SENTRY_PUBLIC_KEY: process.env.SENTRY_PUBLIC_KEY,
        SENTRY_SECRET_KEY: process.env.SENTRY_SECRET_KEY,
        SENTRY_PROJECT_ID: process.env.SENTRY_PROJECT_ID,
        HCAPTCHA_SITE_KEY: process.env.HCAPTCHA_SITE_KEY,
        WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID,
        VERIFF_API_KEY: process.env.VERIFF_API_KEY,
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
