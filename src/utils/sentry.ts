import { init, Native } from 'sentry-expo';
import settings from '../settings';

init({
    dsn: `https://${settings.config.sentryPublicKey}@${settings.config.sentrySecretKey}.ingest.de.sentry.io/${settings.config.sentryProjectId}`,
    enableInExpoDevelopment: false,
    debug: !settings.isProduction(),
});

export function logError(message: string, error: Error) {
    if (settings.isProduction()) {
        Native.captureException(error);
    } else {
        console.log(message + ': verbose error', JSON.stringify(error, null, 2));
    }

    console.error(message, error);
}
