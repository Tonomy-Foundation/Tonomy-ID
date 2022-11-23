const env = process.env.NODE_ENV || 'development';
console.log(`NODE_ENV=${env}`);

type ConfigType = {
    blockchainUrl: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        tertiaryColor: string;
    };
    appName: string;
    ecosystemName: string;
    appSlogan: string;
    images: {
        splash: string;
        logo48: string;
        logo1024: string;
    };
    links: {
        usernameLearnMore: string;
        passwordLearnMore: string;
        securityLearnMore: string;
        privacyLearnMore: string;
        transparencyLearnMore: string;
    };
    expoProjectId: string;
    accountSuffix: string;
};

type SettingsType = {
    env: string;
    config: ConfigType;
    isProduction: () => boolean;
    sdk: any;
};

let config: ConfigType;
let sdk: any;
const settings: SettingsType = {
    env,
    isProduction: () => settings.env === 'production',
} as SettingsType;

switch (env) {
    case 'development':
        config = require('./config/config.json');
        sdk = require('tonomy-id-sdk');
        break;
    case 'staging':
        config = require('./config/config.staging.json');
        sdk = require('tonomy-id-sdk');
        break;
    case 'production':
        config = require('./config/config.json');
        sdk = require('tonomy-id-sdk');
        // TODO add production config when ready
        break;
    case 'designonly':
        config = require('./config/config.json');
        sdk = require('./utils/mockSDK');
        break;

    default:
        throw new Error('Unknown environment: ' + env);
}

settings.config = config;
settings.sdk = sdk;

export default settings;
