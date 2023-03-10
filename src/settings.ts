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
};

type SettingsType = {
    env: string;
    config: ConfigType;
    isProduction: () => boolean;
};

let config: ConfigType;
const settings: SettingsType = {
    env,
    isProduction: () => settings.env === 'production',
} as SettingsType;

switch (env) {
    case 'test':
    case 'local':
    case 'development':
        config = require('./config/config.json');
        // TODO find a better way switch images
        break;
    case 'staging':
        config = require('./config/config.staging.json');
        break;
    case 'production':
        config = require('./config/config.json');
        // TODO add production config when ready
        break;
    default:
        throw new Error('Unknown environment: ' + env);
}

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

settings.config = config;

export default settings;
