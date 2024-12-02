import { init, captureException } from '@sentry/react-native';
import settings from '../settings';
import { ExclusiveEventHintOrCaptureContext } from '@sentry/core/types/utils/prepareEvent';
import { SeverityLevel } from '@sentry/types/types/severity';
import { debugLog } from './debug';

// TODO:
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

export function captureError(message: string, error: Error, level: SeverityLevel = 'error'): string {
    if (settings.isProduction()) {
        return sendToSentry(message, error, level);
    } else {
        console.error('Error: ' + message + ': ', error);
        return 'sentry-not-active';
    }
}

/**
 * Creates a readable text blog from the debug logs and sends it to Sentry
 */
function createBlobFromDebugLogs(): string {
    const now = new Date();
    let blob = '';

    debugLog.forEach((log) => {
        const diff = now.getTime() - log.dateTime.getTime();

        blob += log.dateTime.toISOString() + `(-${diff / 1000}s)` + ' ' + log.namespace + ': ' + log.message + '\n';
    });

    return blob;
}

function sendToSentry(message: string, error: Error, level: SeverityLevel): string {
    const hint: ExclusiveEventHintOrCaptureContext = {
        extra: {
            // NOTE: For the following line to work, in the Sentry project settings,
            // under "Data Scrubbing", we need to add the following (multiple lines) as Safe Fields:
            // extra.errorJson
            // extra.errorJson.**
            // extra.debugLog
            // extra.debugLog.**
            errorJson: JSON.stringify(error, null, 2),
            debugLog: createBlobFromDebugLogs(),
        },
        tags: {
            message,
        },
        level,
    };

    return captureException(error, hint);
}
