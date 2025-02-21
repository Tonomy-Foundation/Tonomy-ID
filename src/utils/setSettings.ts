import { setSettings } from '@tonomy/tonomy-id-sdk';
import settings from '../settings';

setSettings({
    environment: 'test', //settings.env,
    blockchainUrl: settings.config.blockchainUrl,
    accountSuffix: settings.config.accountSuffix,
    communicationUrl: settings.config.communicationUrl,
    tonomyIdSchema: settings.config.tonomyIdSlug,
    accountsServiceUrl: settings.config.accountsServiceUrl,
    ssoWebsiteOrigin: settings.config.ssoWebsiteOrigin,
    currencySymbol: 'LEOS',
});
