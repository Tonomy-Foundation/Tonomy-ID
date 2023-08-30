const env = process.env.EXPO_NODE_ENV ?? 'development';

const settingsInputs = {
    nodeEnv: process.env.NODE_ENV, // This is set by expo with webpack https://github.com/expo/expo/issues/20360
    expoNodeEnv: process.env.EXPO_NODE_ENV,
    logEnv: process.env.LOG,
    env,
};

console.log('settingsInputs', settingsInputs);

type ConfigType = {
    blockchainUrl: string;
    theme: {
        primaryColor: string;
        primaryColor2: string;
        secondaryColor: string;
        secondaryColor2: string;
        tertiaryColor: string;
        tertiaryColor2: string;
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
        privacyPolicyLearnMore: string;
        termsAndConditionsLearnMore: string;
        usernameLearnMore: string;
        passwordLearnMore: string;
        securityLearnMore: string;
        privacyLearnMore: string;
        transparencyLearnMore: string;
        privacyPolicy: string;
        termsAndConditions: string;
    };
    expoProjectId: string;
    accountSuffix: string;
    ssoWebsiteOrigin: string;
    communicationUrl: string;
    accountsServiceUrl: string;
    tonomyIdSlug: string;
    loggerLevel: 'debug' | 'error';
    captchaSiteKey: string;
};

type SettingsType = {
    env: string;
    config: ConfigType;
    isProduction: () => boolean;
};

let config: ConfigType;
const settings: SettingsType = {
    env,
    isProduction: () => ['production', 'demo', 'staging'].includes(settings.env),
} as SettingsType;

switch (env) {
    case 'test':
    case 'local':
    case 'development':
        config = require('./config/config.json');
        break;
    case 'staging':
        config = require('./config/config.staging.json');
        break;
    case 'demo':
        config = require('./config/config.demo.json');
        break;
    case 'production':
        throw new Error('Production config not implemented yet');
    default:
        throw new Error('Unknown environment: ' + env);
}

config.tonomyIdSlug = config.appName.toLowerCase().replace(/ /g, '-');

if (process.env.BLOCKCHAIN_URL) {
    console.log(`Using BLOCKCHAIN_URL from env:  ${process.env.BLOCKCHAIN_URL}`);
    config.blockchainUrl = process.env.BLOCKCHAIN_URL;
}

if (process.env.SSO_WEBSITE_ORIGIN) {
    console.log(`Using SSO_WEBSITE_ORIGIN from env:  ${process.env.SSO_WEBSITE_ORIGIN}`);
    config.ssoWebsiteOrigin = process.env.SSO_WEBSITE_ORIGIN;
}

if (process.env.VITE_COMMUNICATION_URL) {
    console.log(`Using communication microService from env: ${process.env.VITE_COMMUNICATION_URL}`);
    config.communicationUrl = process.env.VITE_COMMUNICATION_URL;
}

if (process.env.LOG === 'true') {
    console.log(`Using logger level from env: ${process.env.LOG}`);
    config.loggerLevel = 'debug';
}

settings.config = config;

export default settings;
