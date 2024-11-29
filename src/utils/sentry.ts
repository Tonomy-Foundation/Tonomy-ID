import { init, captureException } from '@sentry/react-native';
import settings from '../settings';

init({
    dsn: `https://${settings.config.sentryPublicKey}@${settings.config.sentrySecretKey}.ingest.de.sentry.io/${settings.config.sentryProjectId}`,
    debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

export function logError(message: string, error: Error) {
    if (settings.isProduction()) {
        // TODO: attach last 100 debug logs to the error
        captureException(error);
    } else {
        console.log('Error: ' + message + ': ', error, '\n', JSON.stringify(error, null, 2));
    }

    console.error(message, error);
}
