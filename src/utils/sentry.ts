import { init, captureException } from '@sentry/react-native';
import settings from '../settings';
import { ExclusiveEventHintOrCaptureContext } from '@sentry/core/types/utils/prepareEvent';
import { SeverityLevel } from '@sentry/types/types/severity';
import { debugLog } from './debug';
import { serializeAny } from './strings';

// TODO:
// setup with https://docs.sentry.io/platforms/react-native/tracing/instrumentation/react-navigation/
// attach source maps to release
// connect Sentry with Github for extra insights

if (settings.isProduction()) {
    init({
        dsn: `https://${settings.config.sentryPublicKey}@${settings.config.sentrySecretKey}.ingest.de.sentry.io/${settings.config.sentryProjectId}`,
        debug: false,
        environment: settings.env,
        release: 'tonomy-id@' + process.env.npm_package_version,
    });
}

export function captureError(message: string, error: any, level: SeverityLevel = 'error'): string {
    const errorObject = error instanceof Error ? error : new Error(serializeAny(error));

    if (settings.isProduction()) {
        return sendToSentry(message, errorObject, level);
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
