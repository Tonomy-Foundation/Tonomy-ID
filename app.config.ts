import { ExpoConfig } from 'expo/config';

// const settings = require('./src/settings');
import settings from './build/settings';
import myPackage from './package.json';

const expo: ExpoConfig = {
    scheme: 'tonomy-id',
    name: 'tonomy-id',
    slug: 'tonomy-id',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/tonomy/tonomy-logo1024.png',
    userInterfaceStyle: 'light',
    splash: {
        image: './src/assets/tonomy/tonomy-splash.png',
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
            foregroundImage: './src/assets/tonomy/tonomy-logo1024.png',
            backgroundColor: '#FFFFFF',
        },
        versionCode: 1,
        package: 'foundation.tonomy.tonomyid',
    },
    web: {
        favicon: './src/assets/tonomy/tonomy-logo48.ico',
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

const slug = settings.config.appName.toLowerCase().replaceAll(' ', '-');
const identifier = 'foundation.tonomy.projects.' + slug.replaceAll('-', '');

// Check if inputs are correct
if (!/^[0-9a-zA-Z ]+$/g.test(settings.config.appName)) throw new Error('Invalid app name ' + settings.config.appName);
if (!/^([.]{1})([0-9a-z.]+)$/g.test(settings.config.accountSuffix))
    throw new Error('Invalid account suffix ' + settings.config.accountSuffix);

// Update app.json
// expo.android.package = identifier;
// expo.android.adaptiveIcon.foregroundImage = settings.config.images.logo1024;
expo.icon = settings.config.images.logo1024;
// expo.ios.bundleIdentifier = identifier;
expo.name = settings.config.appName;
expo.scheme = slug;
expo.slug = slug;
// expo.splash.image = settings.config.images.splash;
// expo.web.favicon = settings.config.images.logo48;
expo.version = myPackage.version;

if (!['development', 'designonly'].includes(settings.env)) {
    console.log('Replacing expoProjectId');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!expo.extra) app.expo.extra = {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!expo.extra.eas) app.expo.extra.eas = {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expo.extra.eas.projectId = settings.config.expoProjectId;
}

console.log(JSON.stringify(expo, null, 2));

module.exports = expo;
