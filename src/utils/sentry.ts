import { init } from 'sentry-expo';
import settings from '../settings';

init({
    dsn: `https://${settings.config.sentryPublicKey}@${settings.config.sentrySecretKey}.ingest.de.sentry.io/${settings.config.sentryProjectId}`,
    enableInExpoDevelopment: true,
    debug: !settings.isProduction(),
});
