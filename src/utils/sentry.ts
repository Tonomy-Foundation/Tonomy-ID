import { init, captureException } from '@sentry/react-native';
import settings from '../settings';

// TODO:
// change the way Debug works so that we can see last 100 logs in the attachments
// setup with https://docs.sentry.io/platforms/react-native/tracing/instrumentation/react-navigation/
// attach source maps to release
// connect Sentry with Github for extra insights

if (settings.isProduction()) {
    init({
        dsn: `https://${settings.config.sentryPublicKey}@${settings.config.sentrySecretKey}.ingest.de.sentry.io/${settings.config.sentryProjectId}`,
        // TODO: set to false
        debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
        environment: settings.env,
        release: 'tonomy-id@' + process.env.npm_package_version,
    });
}

export function captureError(message: string, error: Error): string {
    if (settings.isProduction()) {
        return sendToSentry(message, error);
    } else {
        console.error('Error: ' + message + ': ', error);
        return 'sentry-not-active';
    }
}

function sendToSentry(message: string, error: Error): string {
    // https://docs.sentry.io/platforms/javascript/enriching-events/context/#passing-context-directly
    const hint = {
        extra: {
            // NOTE: For the following line to work, in the Sentry project settings,
            // under "Data Scrubbing", we need to add "error" as a "safe field" to not scrub
            error: JSON.stringify(error, null, 2),
        },
        tags: {
            message,
        },
    };

    return captureException(error, hint);
}
