import Debug from 'debug';

const debug = Debug('tonomy-id:settings');
const env = process.env.EXPO_NODE_ENV ?? 'development';

const settingsInputs = {
    nodeEnv: process.env.NODE_ENV, // This is set by expo with webpack https://github.com/expo/expo/issues/20360
    expoNodeEnv: process.env.EXPO_NODE_ENV,
    debug: process.env.DEBUG,
    env,
};

debug('settingsInputs', settingsInputs);

type ConfigType = {
    environment: string;
    blockchainUrl: string;
    theme: {
        primaryColor: string;
        disabled: string;
        secondaryColor: string;
        secondaryColor2: string;
        tertiaryColor: string;
        tertiaryColor2: string;
        text: string;
        textGray: string;
        linkColor: string;
        infoBackground: string;
        lightBackground: string;
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
    tonomyAppsOrigin: string;
    tonomyIdSlug: string;
    captchaSiteKey: string;
    blockExplorerUrl: string;
    infuraKey: string;
    etherscanApiKey: string;
    walletConnectProjectId: string;
    sentryPublicKey: string;
    sentrySecretKey: string;
    sentryProjectId: string;
    currencySymbol: string;
    veriffApiKey: string;
};

type SettingsType = {
    env: string;
    config: ConfigType;
    isProduction: () => boolean;
};

let config: ConfigType;
const settings: SettingsType = {
    env,
    isProduction: () => ['production', 'testnet', 'staging'].includes(settings.env),
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
    case 'testnet':
        config = require('./config/config.testnet.json');
        break;
    case 'production':
        config = require('./config/config.production.json');
        break;
    default:
        throw new Error('Unknown environment: ' + env);
}

if (process.env.BLOCKCHAIN_URL) {
    debug(`Using BLOCKCHAIN_URL from env:  ${process.env.BLOCKCHAIN_URL}`);
    config.blockchainUrl = process.env.BLOCKCHAIN_URL;
}

if (process.env.SSO_WEBSITE_ORIGIN) {
    debug(`Using SSO_WEBSITE_ORIGIN from env:  ${process.env.SSO_WEBSITE_ORIGIN}`);
    config.ssoWebsiteOrigin = process.env.SSO_WEBSITE_ORIGIN;
}

if (process.env.VITE_COMMUNICATION_URL) {
    debug(`Using communication microService from env: ${process.env.VITE_COMMUNICATION_URL}`);
    config.communicationUrl = process.env.VITE_COMMUNICATION_URL;
}

if (process.env.ACCOUNTS_SERVICE_URL) {
    debug(`Using accounts microService from env: ${process.env.ACCOUNTS_SERVICE_URL}`);
    config.accountsServiceUrl = process.env.ACCOUNTS_SERVICE_URL;
}

if (process.env.HCAPTCHA_SITE_KEY) {
    debug(`Using hCaptcha site key from env: ${process.env.HCAPTCHA_SITE_KEY}`);
    config.captchaSiteKey = process.env.HCAPTCHA_SITE_KEY;
}

if (process.env.SENTRY_SECRET_KEY) {
    debug(`Using Sentry secret key from env: ************`);
    config.sentrySecretKey = process.env.SENTRY_SECRET_KEY;
}

if (process.env.INFURA_KEY) {
    config.infuraKey = process.env.INFURA_KEY;
}

if (process.env.ETHERSCAN_API_KEY) {
    config.etherscanApiKey = process.env.ETHERSCAN_API_KEY;
}

if (process.env.WALLETCONNECT_PROJECT_ID) {
    config.walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID;
}

if (process.env.VERIFF_API_KEY) {
    config.veriffApiKey = process.env.VERIFF_API_KEY;
}

config.sentryPublicKey = '49c8103bafbb9ebd792b3e3db9f91e76';
config.sentryProjectId = '4508392816705616';
config.environment = env;

settings.config = config;

export default settings;
