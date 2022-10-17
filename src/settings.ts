const env = process.env.NODE_ENV || 'development';

type ConfigType = {
    blockchainUrl: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
    };
    appName: string;
    appSlogan: string;
    appLogoUrl: string;
};
let config: ConfigType;

type SettingsType = {
    env: string;
    config: ConfigType;
    isProduction: () => boolean;
};
const settings: SettingsType = {
    env,
    isProduction: () => settings.env === 'production',
} as SettingsType;

switch (env) {
    case 'development':
        config = require('./config/config.json');
        break;
    case 'staging':
        config = require('./config/config.staging.json');
        break;
    case 'production':
    // TODO add production config when ready
    default:
        throw new Error('Unknown environment: ' + env);
}

settings.config = config;

export default settings;
