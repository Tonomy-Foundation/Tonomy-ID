import { init, captureException, withScope } from '@sentry/react-native';
// import { ExclusiveEventHintOrCaptureContext } from '@sentry/types';
import settings from '../settings';

// TODO:
// update JS / RN error handlers
// should be imported first?
// change the way Debug works!!!
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

export function captureError(message: string, error: Error, hint?: any): string {
    if (settings.isProduction()) {
        // TODO: attach last 100 debug logs to the error
        const extra = {
            error: JSON.stringify(error, null, 2),
        }

        return sendToSentry(message, error, { extra });
    } else {
        console.error('Error: ' + message + ': ', error);
        return 'sentry-not-active';
    }
}

function sendToSentry(message: string, error: Error, context?: { extra?: any, tags?: any }): string {
    let eventId = 'undefined-event-id';

    // https://github.com/getsentry/sentry-javascript/issues/1607#issuecomment-548013930
    withScope(scope => {
        if (context) {
            if (context.extra) {
                Object.keys(context.extra).forEach(key => {
                    console.log(`Adding extra scope: ${key} = ${context.extra[key]}`);
                    scope.setExtra(key, context.extra[key]);
                });
            }

            if (context.tags) {
                Object.keys(context.tags).forEach(key => {
                    scope.setTag(key, context.tags[key]);
                });
            }
        }
        scope.setExtra('message', message);
        scope.setTag('message2', message)
        eventId = captureException(error);
    });

    return eventId;
}
