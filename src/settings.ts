import Debug from 'debug';
import Constants from 'expo-constants';

const debug = Debug('tonomy-id:settings');
const expoConfig = Constants.expoConfig?.extra || process.env;

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

if (expoConfig.HCAPTCHA_SITE_KEY) {
    debug(`Using hCaptcha site key from env: ${expoConfig.HCAPTCHA_SITE_KEY}`);
    config.captchaSiteKey = expoConfig.HCAPTCHA_SITE_KEY;
}

if (expoConfig.SENTRY_SECRET_KEY) {
    debug(`Using Sentry secret key from env: ************`);
    config.sentrySecretKey = expoConfig.SENTRY_SECRET_KEY;
}

if (expoConfig.INFURA_KEY) {
    debug(`Using Infura key from env: ************`);
    config.infuraKey = expoConfig.INFURA_KEY;
}

if (expoConfig.ETHERSCAN_API_KEY) {
    debug(`Using Etherscan API key from env: ************`);
    config.etherscanApiKey = expoConfig.ETHERSCAN_API_KEY;
}

if (expoConfig.WALLETCONNECT_PROJECT_ID) {
    debug(`Using WalletConnect Project ID from env: ************`);
    config.walletConnectProjectId = expoConfig.WALLETCONNECT_PROJECT_ID;
}

if (expoConfig.VERIFF_API_KEY) {
    debug(`Using Veriff API key from env: ************`);
    config.veriffApiKey = expoConfig.VERIFF_API_KEY;
}

if (expoConfig.SENTRY_PUBLIC_KEY) {
    debug(`Using Sentry public key from env: ************`);
    config.sentryPublicKey = expoConfig.SENTRY_PUBLIC_KEY;
}

if (expoConfig.SENTRY_PROJECT_ID) {
    debug(`Using Sentry project ID from env: ************`);
    config.sentryProjectId = expoConfig.SENTRY_PROJECT_ID;
}

config.environment = env;
settings.config = config;

export default settings;
