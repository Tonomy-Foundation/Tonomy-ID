import { init, captureException, wrap as sentryWrap, setUser as sentrySetUser, User, Hub } from '@sentry/react-native';
import settings from '../settings';
import { ExclusiveEventHintOrCaptureContext } from '@sentry/core/types/utils/prepareEvent';
import { SeverityLevel } from '@sentry/types/types/severity';
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

    console[levelToLoggerLevel(level)](
        `captureError(): ${message}`,
        errorObject,
        errorObject.stack,
        error instanceof Error
    );

    if (settings.isProduction()) {
        return sendToSentry(message, errorObject, level);
    } else {
        return 'sentry-not-active';
    }
}

function levelToLoggerLevel(level: SeverityLevel): 'error' | 'log' | 'warn' | 'debug' | 'info' {
    switch (level) {
        case 'error':
        case 'log':
        case 'debug':
        case 'info':
            return level;
        case 'warning':
            return 'warn';
        case 'fatal':
            return 'error';
    }
}

export function wrap(component: React.ComponentType): React.ComponentType {
    if (settings.isProduction()) {
        return sentryWrap(component);
    } else {
        return component;
    }
}

export function setUser(user: User | null): ReturnType<Hub['setUser']> | null {
    if (settings.isProduction()) {
        return sentrySetUser(user);
    } else {
        return null;
    }
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

    // Truncate to 16kB (16267 characters) as per size limit in sentry
    while (blobs.join('').length > 16267) {
        blobs.shift();
    }

    return blobs.join('');
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
