import { setSettings } from '@tonomy/tonomy-id-sdk';
import settings from '../settings';

const env = settings.env;

setSettings({
    environment: env,
    blockchainUrl: settings.config.blockchainUrl,
    accountSuffix: settings.config.accountSuffix,
    communicationUrl: settings.config.communicationUrl,
    tonomyIdSchema: settings.config.tonomyIdSlug,
    accountsServiceUrl: settings.config.accountsServiceUrl,
    ssoWebsiteOrigin: settings.config.ssoWebsiteOrigin,
    currencySymbol: settings.config.currencySymbol,
});
