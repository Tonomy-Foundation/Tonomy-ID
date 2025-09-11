import { init, captureException, wrap as sentryWrap, setUser as sentrySetUser } from '@sentry/react-native';
import type { User, SeverityLevel } from '@sentry/types';
import type { Hub } from '@sentry/core';
import settings from '../settings';
import { debugLog } from './debug';
import { serializeAny } from './strings';

// TODO:
// setup with https://docs.sentry.io/platforms/react-native/tracing/instrumentation/react-navigation/
// check how to set release version with commit hash

if (settings.isProduction()) {
    init({
        dsn: `https://${settings.config.sentryPublicKey}@${settings.config.sentrySecretKey}.ingest.de.sentry.io/${settings.config.sentryProjectId}`,
        debug: false,
        environment: settings.env,
    });
}

export function captureError(message: string, error: any, level: SeverityLevel = 'error'): string {
    const errorObject = error instanceof Error ? error : new Error(serializeAny(error));

    if (settings.isProduction()) {
        return sendToSentry(message, errorObject, level);
    } else {
        console[level](`captureError(): ${message}`, errorObject.stack || errorObject);
        return 'sentry-not-active';
    }
}

export function wrap(component: React.ComponentType): React.ComponentType {
    return settings.isProduction() ? sentryWrap(component) : component;
}

export function setUser(user: User | null): ReturnType<Hub['setUser']> | null {
    return settings.isProduction() ? sentrySetUser(user) : null;
}

/**
 * Creates a readable text blog from the debug logs and sends it to Sentry
 */
export function createBlobFromDebugLogs(): string {
    const now = new Date();
    const blobs: string[] = [];

    // Get log strings
    debugLog.forEach((log) => {
        const diff = now.getTime() - log.dateTime.getTime();
        const blobString =
            log.dateTime.toISOString() + `(-${diff / 1000}s)` + ' ' + log.namespace + ': ' + log.message + '\n';

        blobs.push(blobString);
    });

    // Truncate to 16kB (16267 characters) as per size limit in Sentry
    while (blobs.join('').length > 16267) {
        blobs.shift();
    }

    return blobs.join('');
}

function sendToSentry(message: string, error: Error, level: SeverityLevel): string {
    const context = {
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

    return captureException(error, context);
}
