import { init, captureException } from '@sentry/react-native';
import settings from '../settings';
import Debug from 'debug';

const debug = new Debug('tonomy-id:utils:sentry');

// TODO:
// change to one project with multiple environments
// update JS / RN error handlers
// should be imported first
// change the way Debug works!!!
// setup with https://docs.sentry.io/platforms/react-native/tracing/instrumentation/react-navigation/
// check that the OS + release is set correctly
// attach source maps to release

if (settings.isProduction()) {
    init({
        dsn: `https://${settings.config.sentryPublicKey}@${settings.config.sentrySecretKey}.ingest.de.sentry.io/${settings.config.sentryProjectId}`,
        // TODO: set to false
        debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
        environment: settings.env,
        release: "tonomy-id@" + process.env.npm_package_version,
    });
}

export function captureError(message: string, error: Error) {
    if (settings.isProduction()) {
        // TODO: attach last 100 debug logs to the error
        // TODO: attach the account name + username to the error
        console.log('Sending error to sentry', message);
        captureException(error);
    } else {
        console.error('Error: ' + message + ': ', error);
    }
}
